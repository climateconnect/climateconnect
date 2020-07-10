export function parseOptions(options, parentPropertyName) {
  return options
    .filter(o => o[parentPropertyName] === null)
    .map(o => {
      return {
        ...o,
        name: o.name,
        key: o.id,
        subcategories: options
          .filter(so => so[parentPropertyName] === o.id)
          .map(so => {
            return {
              ...so,
              name: so.name,
              key: so.id,
              id: so.id
            };
          })
      };
    });
}
