
module.exports = {


  friendlyName: 'Send slack notification',


  description: '',


    inputs: {

        settings: {
            type: 'ref',
            example: '',
            description: 'Slack settings.',
            required: true
        },
        message: {
            type: 'string',
            example: '',
            description: '',
            required: true
        }

  },


  exits: {

    success: {
      description: 'All done.'
    }

  },


    fn: async function (inputs, exits) {

      sails.log("Sending notification to slack", inputs.settings.data.integrations, inputs.message);

        var slack = _.find(inputs.settings.data.integrations, function (item) {
            return item.id === 'slack';
        });

      if (!slack || !slack.config.enabled) return;

      // Send notification to slack
      var IncomingWebhook = require('@slack/client').IncomingWebhook;

        var field = _.find(slack.config.fields, function (item) {
            return item.id === 'slack_webhook_url';
        });

      var url = field ? field.value : "";

      var webhook = new IncomingWebhook(url);

      webhook.send(inputs.message, function (err, header, statusCode, body) {
          if (err) {
              sails.log('Error:', err);
          } else {
              sails.log('Received', statusCode, 'from Slack');
              return exits.success();
          }
      });
  }


};

