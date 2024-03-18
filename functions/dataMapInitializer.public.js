exports.handler = async (context, event, callback) => {
  // Grab a reference to the Sync object since we'll be using it a few times
  const sync = Runtime.getSync();

  try {
    // Make all of the maps needed for the project This is only needed once per account
    const assets = await sync.maps.create({ uniqueName: "assets" });
    const call_logs = await sync.maps.create({ uniqueName: "call_logs" });
    const asset_settings = await sync.maps.create({
      uniqueName: "asset_settings",
    });
    const clients = await sync.maps.create({ uniqueName: "clients" });
    return callback(null, newMapItem);
  } catch (error) {
    // Be sure to log and return any errors that occur!
    console.error("Sync Error: ", error);
    return callback(null, error);
  }
};
