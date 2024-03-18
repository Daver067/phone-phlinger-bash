exports.handler = async (context, event, callback) => {
  //TODO I changed the way assets data is. Need to update

  // Grab a reference to the Sync object since we'll be using it a few times
  const sync = Runtime.getSync();
  const response = new Twilio.Response();
  // Set the CORS headers to allow Flex to make an error-free HTTP request
  // to this Function
  response.appendHeader("Access-Control-Allow-Origin", "*");
  response.appendHeader("Access-Control-Allow-Methods", "POST");
  response.appendHeader("Access-Control-Allow-Headers", "Content-Type");
  response.appendHeader("Content-Type", "application/json");
  if (event.method === "fetch") {
    // send over the data I requested
    try {
      // Make all of the maps needed for the project
      let keys = {};
      if (event.map !== "all") {
        await sync
          .maps(event.map)
          .syncMapItems.list()
          .then((mapitem) => {
            mapitem.forEach((item) => {
              // everything is indexed by its phone number except call_logs
              if (event.map !== "call_logs") {
                keys[item.data.phone_number] = item.data;
              } else if (event.map === "call_logs") {
                keys[item.data.call_sid] = item.data;
              }
            });
          });
        response.setBody(keys);
        // Return a success response using the callback function
        return callback(null, response);
      } else if (event.map === "all") {
        await sync
          .maps("assets")
          .syncMapItems.list()
          .then((assets) => {
            keys["assets"] = {};
            assets.forEach((asset) => {
              keys["assets"][asset.data.phone_number] = asset.data;
            });
          });
        await sync
          .maps("phone_numbers")
          .syncMapItems.list()
          .then((phone_numbers) => {
            keys["phone_numbers"] = {};
            phone_numbers.forEach((phone_number) => {
              // everything is indexed by its phone number except call_logs
              keys["phone_numbers"][phone_number.data.phone_number] =
                phone_number.data;
            });
          });
        await sync
          .maps("clients")
          .syncMapItems.list()
          .then((clients) => {
            keys["clients"] = {};
            clients.forEach((client) => {
              // everything is indexed by its phone number except call_logs
              keys["clients"][client.data.phone_number] = client.data;
            });
          });
        response.setBody(keys);
        // Return a success response using the callback function
        return callback(null, response);
      }
    } catch (error) {
      // Be sure to log and return any errors that occur!
      console.error("Sync Error: ", error);
      return callback(error);
    }
  }
  if (event.method === "delete") {
    // I need to delete a mapItem
    try {
      await sync.maps(event.map).syncMapItems(event.item.phone_number).remove();
      response.setBody({ success: "delete successful" });
      return callback(null, response);
    } catch (error) {
      // Be sure to log and return any errors that occur!
      console.error("Sync Error: ", error);
      return callback(error);
    }
  }
  if (event.method === "create") {
    // I need to create a mapItem
    try {
      if (event.map === "assets") {
        await sync.maps(event.map).syncMapItems.create({
          key: event.item.phone_number,
          data: {
            name: event.item.name,
            phone_number: event.item.phone_number,
            email: event.item.email,
            client: event.item.client,
            settings: event.item.settings,
          },
        });
      }
      if (event.map === "phone_numbers") {
        await sync.maps(event.map).syncMapItems.create({
          key: event.item.phone_number,
          data: {
            name: event.item.name,
            phone_number: event.item.phone_number,
          },
        });
      }
      if (event.map === "clients") {
        await sync.maps(event.map).syncMapItems.create({
          key: event.item.phone_number,
          data: {
            name: event.item.name,
            phone_number: event.item.phone_number,
            email: event.item.email,
          },
        });
      }
      // shouldn't have to create a call log with the front end.
      response.setBody({ success: "create successful" });
      return callback(null, response);
    } catch (error) {
      // Be sure to log and return any errors that occur!
      console.error("Sync Error: ", error);
      return callback(error);
    }
  }
  if (event.method === "update") {
    try {
      // This works for settings for sure...
      //TODO ensure this works with phone number edit
      await sync.maps(event.map).syncMapItems(event.item.phone_number).update({
        data: event.item,
      });

      // Return a success response using the callback function
      response.setBody({ success: "create successful" });
      return callback(null, response);
    } catch (error) {
      // Be sure to log and return any errors that occur!
      console.error("Sync Error: ", error);
      return callback(error);
    }
  } else return callback();
};
