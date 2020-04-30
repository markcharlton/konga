
/**
   * Fix invalid semver formats like `0.14.0rc2`
   * A valid semver format would be `0.14.0-rc2`
   * This patch addresses a very specific version invalidity.
   * It does not intent to fix invalid semver formats in general.
**/



module.exports = {


  friendlyName: 'Ensure semver format',


  description: '',


    inputs: {

        version: {
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


  fn: function (inputs, exits) {    
          if (inputs.version.indexOf("-") < 0) {
              // Find the index of the first alphanumeric character in the version string
              let firstAlphaIndex = inputs.version.search(/[a-zA-Z]/);
              if (firstAlphaIndex > -1) {
                  // Remove everything from that character onward
                  return exits.success(inputs.version.substring(0, firstAlphaIndex));
              }
          }

          return exits.success(inputs.version);
  }


};

