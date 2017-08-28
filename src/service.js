let grpc = require('grpc');
let protoDescriptor = grpc.load(__dirname + '/cxmate.proto');
let proto = protoDescriptor.proto;

class Service {

  process(inputStream) {
    throw new Error('Service.process must have a subclass implementation');
  }

  streamNetworks(inputStream) {
    this.process(inputStream);
  }

  run(listenOn = '0.0.0.0:8080') {
    const server = new grpc.Server();
    server.addService(proto.cxMateService.service, {
      streamNetworks: this.streamNetworks,
    });
    server.bind(listenOn, grpc.ServerCredentials.createInsecure());
    server.start();
  }
}

module.exports = Service;
