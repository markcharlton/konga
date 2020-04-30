var moment = require("moment");

module.exports = {


  friendlyName: 'Get minutes diff',


  description: '',


    inputs: {

        start: {
            type: 'string',
            example: '',
            description: 'Start time.',
            required: true
        },
        end: {
            type: 'string',
            example: '',
            description: 'End time.',
            required: true
        }

  },


  exits: {

    success: {
      outputFriendlyName: 'Minutes diff'
    }

  },


  fn: function (inputs, exits) {

    // Get minutes diff.
    var duration = moment.duration(moment(inputs.start).diff(moment(inputs.end)));
          
     
    // Send back the result through the success exit.
      return exits.success(duration.asMinutes());

  }


};

