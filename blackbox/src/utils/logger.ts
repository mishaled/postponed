let originalLog;
let originalInfo;
let originalError;

const mock = () => {
    originalLog = console.log;
    originalInfo = console.info;
    originalError = console.error;

    console.log = () => {};
    console.info = () => {};
    console.error = () => {};
};

const restore = () => {
    console.log = originalLog;
    console.info = originalInfo;
    console.error = originalError;
};

export default {mock, restore};
