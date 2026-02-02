const axios = require('axios');

async function testApi() {
    try {
        const res = await axios.get('http://192.168.43.56:3000/api/diagnostic/joint-pain/questions');
        console.log("Status:", res.status);
        console.log("Data Length:", res.data.length);
        console.log("First Question:", JSON.stringify(res.data[0], null, 2));
    } catch (err) {
        console.error("Error:", err.message);
    }
}

testApi();
