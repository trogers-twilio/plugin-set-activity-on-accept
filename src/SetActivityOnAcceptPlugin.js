import React from 'react';
import { VERSION } from '@twilio/flex-ui';
import { FlexPlugin } from 'flex-plugin';

const PLUGIN_NAME = 'SetActivityOnAcceptPlugin';

export default class SetActivityOnAcceptPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  init(flex, manager) {
    const talkingActivity = 'Talking';
    const availableActivity = 'Available';

    flex.Actions.addListener('afterAcceptTask', (payload) => {
      const { task } = payload;
      // The interval is because the activity change will fail if the task status is 'pending',
      // and it takes some time after task acceptance for that status to change.
      const setActivityInterval = setInterval(() => {
        const { status } = task;
        if (status === 'accepted') {
          flex.Actions.invokeAction('SetActivity', { activityName: talkingActivity });
          clearInterval(setActivityInterval);
        }
      }, 50);
      setTimeout(() => {
        clearInterval(setActivityInterval);
      }, 5000);
    });

    flex.Actions.addListener('afterCompleteTask', () => {
      const { name: currentActivityName } = manager.workerClient.activity;
      if (currentActivityName !== talkingActivity) {
        // This means the worker changed it to another activity, so we're not going to change it.
        return;
      }
      const setActivityInterval = setInterval(() => {
        const { tasks } = manager.store.getState().flex.worker;
        console.debug('Current tasks size:', tasks && tasks.size);
        if (tasks && tasks.size === 0) {
          flex.Actions.invokeAction('SetActivity', { activityName: availableActivity });
        }
      }, 50);
      setTimeout(() => {
        clearInterval(setActivityInterval);
      }, 5000);
    });
  }
}
