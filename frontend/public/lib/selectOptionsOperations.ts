export function parseOptions(options, parentPropertyName) {
  //Return an array of parent properties with their subcategories. If the parent property of an item is missing: assume it's a top level property
  return options
    .filter(
      (o) =>
        o[parentPropertyName] === null ||
        options.filter((io) => io.id === o[parentPropertyName]).length === 0
    )
    .map((o) => {
      return {
        ...o,
        name: o.name,
        key: o.id,
        subcategories: options
          .filter((so) => so[parentPropertyName] === o.id)
          .map((so) => {
            return {
              ...so,
              name: so.name,
              key: so.id,
              id: so.id,
            };
          }),
      };
    });
}

export function parseSectorOptions(options) {
  return options.map((o) => {
    const { image, ...rest } = o;
    return {
      ...rest,
      thumbnail_image: image,
    };
  });
}

export function transformSectorOptionsToPerthSubHub(originalArray) {
  // Define the mapping for name changes.
  const nameMapping = {
    "Education": "Climate Café",
    "Food & Agriculture": "Food",
    "Nature & Biodiversity": "Nature",
    "Mobility": "Transport",
    "Resources & Consumption": "Zero Waste"
  };

  const allowedOriginalNames = [
    "Energy"
  ];

  //hasOwnProperty method used to check if nameMapping object has a property with a specified name
  const filteredArray = originalArray.filter(item => {
    return nameMapping.hasOwnProperty(item.name) || allowedOriginalNames.includes(item.name);
  });

  const newArray = filteredArray.map(item => {
    const newItem = { ...item };

    if (nameMapping.hasOwnProperty(newItem.name)) {
      newItem.name = nameMapping[newItem.name];
      newItem.original_name = nameMapping[item.name];
    }
    return newItem;
  });

  return newArray;
}
