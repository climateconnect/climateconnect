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
    const { image, ...rest } = o; // Destructure to remove `image`
    return {
      ...rest,
      thumbnail_image: image,
    };
  });
}
