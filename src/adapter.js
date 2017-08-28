class Adapter {

  static toCyJS(inputStream, callback) {
    inputStream.on('data', (networkElement) => {
      let elements = [];
      switch (networkElement.element) {
        case 'node':
          elements.push({
            group: 'nodes',
            data: {
              id: networkElement.id,
              name: networkElement.name,
              represents: networkElement.represents,
            },
          });
          break;
        case 'edge':
          elements.push({
            group: 'edges',
            data: {
              id: networkElement.id,
              source: networkElement.sourceId,
              target: networkElement.targetId,
              interaction: networkElement.interaction,
            },
          });
          break;
      }
      callback(elements);
    });
  }
}

module.exports = Adapter;
