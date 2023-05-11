const { assert } = require("chai");
const io = require("socket.io-client");
const socket = io("ws://localhost:3000");

describe("Socket Server", () => {
    before((done) => {
        socket.on("connect", () => {
            // or with emit() and custom event names
            socket.emit("salutation", "Hello!");
            socket.emit("joinBuyerRoom", "643e195aa398550ffbfa4c1a");
            socket.emit("bidAccepted", "643e195aa398550ffbfa4c1a");
        });
        done();
    });


    after(() => {
        socket.close();
    });

    it("greeting", (done) => {
        socket.on("greeting", (arg) => {
            assert.equal(arg, "Hello!");
            done();
        });
    });

    it("Bid Accepted", (done) => {
        socket.on("bidAcceptedPopup", (bid) => {
            assert.equal(bid._id, "643e195aa398550ffbfa4c1a");
            done();
        });
    });
});