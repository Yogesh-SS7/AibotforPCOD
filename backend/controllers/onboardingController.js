const fs = require('fs');
const path = require('path');

const usersFile = path.join(__dirname, '../data/users.json');

// Ensure data directory exists (though write_to_file handles this, runtime might need it for read)
if (!fs.existsSync(path.dirname(usersFile))) {
    fs.mkdirSync(path.dirname(usersFile), { recursive: true });
}

const saveUser = (userData) => {
    let users = [];
    if (fs.existsSync(usersFile)) {
        try {
            const data = fs.readFileSync(usersFile);
            users = JSON.parse(data);
        } catch (err) {
            console.error("Error reading users file:", err);
            users = [];
        }
    }
    // Simple update or add
    const existingIndex = users.findIndex(u => u.phone === userData.phone);
    if (existingIndex >= 0) {
        users[existingIndex] = { ...users[existingIndex], ...userData };
    } else {
        users.push(userData);
    }

    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
};

exports.initiateOnboarding = (req, res) => {
    const { name, age, weight, city, phone, language, bmi, bmi_category } = req.body;

    if (!name || !age || !weight || !city || !phone) {
        return res.status(400).json({ error: "Name, Age, Weight, City, and Mobile Number are required." });
    }

    // Determine ID (Sequential)
    let users = [];
    if (fs.existsSync(usersFile)) {
        try {
            users = JSON.parse(fs.readFileSync(usersFile));
        } catch (e) { users = []; }
    }
    // Check if user exists to reuse ID, else new ID
    const existing = users.find(u => u.phone === phone);
    const userId = existing ? existing.id : (users.length + 1).toString();

    // Save temporary state or simplified user
    const user = {
        id: userId,
        name,
        age,
        weight,
        city,
        phone,
        language: language || 'English',
        bmi,
        bmi_category,
        onboardedAt: new Date().toISOString()
    };

    saveUser(user);

    // Mock OTP
    console.log(`[Mock OTP] generated for ${phone}: 1234`);

    res.json({
        message: "OTP sent successfully (Mock: 1234)",
        otp: "1234", // Returning it for prototype ease
        userId: user.id
    });
};

exports.verifyOtp = (req, res) => {
    const { phone, otp } = req.body;

    if (otp === "1234") {
        res.json({ success: true, message: "Onboarding Complete." });
    } else {
        res.status(400).json({ success: false, message: "Invalid OTP provided." });
    }
};
