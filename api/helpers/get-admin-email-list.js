// Get admin email list helper



module.exports = {


  friendlyName: 'Get admin email list',


  description: '',


    inputs: {

        cb: {
            type: 'string',
            example: '',
            description: '',
            required: true
        }

  },


  exits: {

    success: {
      outputFriendlyName: 'Admin email list'
      },
      noAdminEmailFound: {
          description: 'No admin email found'
      }

  },


  fn: function (inputs, exits) {

    // Get admin email list.
   
      sails.models.user.find({
          admin: true
      }).exec(function (err, admins) {
          if (err)
              return exits.noAdminEmailFound(err);
          if (!admins.length) return inputs([]);
          return input(null, admins.map(function (item) {
              return exits.success(item.email);     // Send back the result through the success exit.
          }));
      });

   
  }


};

