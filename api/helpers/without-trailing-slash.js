
module.exports = {


  friendlyName: 'Without trailing slash',


  description: '',


    inputs: {

        str: {
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
          if (!inputs.str) return exits.success(inputs.str);
      return exits.success(inputs.str.replace(/\/$/, ""));
      }


};

