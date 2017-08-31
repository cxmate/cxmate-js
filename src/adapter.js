let cytoscape = require('cytoscape');

class Adapter {
  static fromCyJS(model, callback) {
    let cy = cytoscape(model);
    for (let node of cy.elements('node').toArray()) {
      let id = this.stripId(node.data().id);
      let data = node.data();
      callback({
        label: 'Output',
        element: 'node',
        node: {
          id: id,
          name: data.name,
          represents: data.represents,
        },
      });
      delete data.id;
      delete data.name;
      delete data.represents;
      for (let nodeAttr in data) {
        let type = typeof data[nodeAttr];
        callback({
          label: 'Output',
          element: 'nodeAttribute',
          nodeAttribute: {
            nodeId: id,
            name: nodeAttr,
            value: data[nodeAttr].toString(),
            type: type,
          },
        });
      }
    }
    for (let edge of cy.elements('edge').toArray()) {
      let id = this.stripId(edge.data().id);
      let data = edge.data();
      callback({
        label: 'Output',
        element: 'edge',
        edge: {
          id: id,
          sourceId: this.stripId(data.source),
          targetId: this.stripId(data.target),
          interaction: data.interaction,
        },
      });
      delete data.id;
      delete data.source;
      delete data.target;
      delete data.interaction;
      for (let edgeAttr in data) {
        let type = typeof data[edgeAttr];
        callback({
          label: 'Output',
          element: 'edgeAttribute',
          edgeAttribute: {
            edgeId: id,
            name: edgeAttr,
            value: data[edgeAttr].toString(),
            type: type,
          },
        });
      }
    }
  }

  static toCyJS(inputStream, callback) {
    let data = {};
    let nodes = {};
    let edges = {};
    inputStream.on('data', (networkElement) => {
      switch (networkElement.element) {
        case 'node': {
          let node = networkElement.node;
          nodes[node.id] = {
            group: 'nodes',
            data: {
              id: this.convertId('node', node.id),
              name: node.name,
              represents: node.represents,
            },
          };
          break;
        }
        case 'edge': {
          let edge = networkElement.edge;
          edges[edge.id] = {
            group: 'edges',
            data: {
              id: this.convertId('edge', edge.id),
              source: this.convertId('node', edge.sourceId),
              target: this.convertId('node', edge.targetId),
              interaction: edge.interaction,
            },
          };
          break;
        }
        case 'nodeAttribute': {
          let nodeAttr = networkElement.nodeAttribute;
          let value = this.castAttribute(nodeAttr.value, nodeAttr.type);
          if (nodeAttr.nodeId in nodes) {
            nodes[nodeAttr.nodeId].data[nodeAttr.name] = value;
          } else {
            nodes[nodeAttr.nodeId] = {
              group: 'nodes',
              data: {
                id: this.convertId('node', nodeAttr.nodeId),
                [nodeAttr.name]: value,
              },
            };
          }
          break;
        }
        case 'edgeAttribute': {
          let edgeAttr = networkElement.edgeAttribute;
          let value = this.castAttribute(edgeAttr.value, edgeAttr.type);
          if (edgeAttr.edgeId in edges) {
            edges[edgeAttr.edgeId].data[edgeAttr.name] = value;
          } else {
            edges[edgeAttr.edgeId] = {
              group: 'edges',
              data: {
                id: this.convertId('edge', edgeAttr.edgeId),
                [edgeAttr.name]: value,
              },
            };
          }
          break;
        }
        case 'networkAttribute': {
          let networkAttr = networkElement.networkAttribute;
          let value = this.castAttribute(networkAttr.value, networkAttr.type);
          data[networkAttr.name] = value;
          break;
        }
      }
    });
    inputStream.on('end', () => {
      let nodeList = Object.keys(nodes).map((key) => nodes[key]);
      let edgeList = Object.keys(edges).map((key) => edges[key]);
      callback({
        elements: [...nodeList, ...edgeList],
        data,
      });
    });
  }

  static castAttribute(value, type) {
    switch (type.toLowerCase()) {
      case 'float', 'double', 'number': {
        return parseFloat(value);
      }
      case 'integer': {
        return parseInt(value);
      }
      case 'bool', 'boolean': {
        return value.toLowerCase() == 'true';
      }
      default: {
        return value;
      }
    }
  }

  static convertId(type, id) {
    if (type == 'node') {
      return 'n' + id.toString();
    } else {
      return 'e' + id.toString();
    }
  }

  static stripId(id) {
    return id.substr(1);
  }
}

module.exports = Adapter;
