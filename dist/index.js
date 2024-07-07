"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const client_1 = require("@prisma/client");
const nodemailer_1 = __importDefault(require("nodemailer"));
const cors_1 = __importDefault(require("cors")); // Import CORS middleware
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
app.use((0, cors_1.default)()); // Use CORS middleware
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
// Nodemailer setup
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
// API endpoint to handle referral submission
app.post('/api/refer', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { referrerName, referrerEmail, refereeName, refereeEmail } = req.body;
    if (!referrerName || !referrerEmail || !refereeName || !refereeEmail) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    try {
        // Save referral to database
        const referral = yield prisma.referral.create({
            data: {
                referrerName,
                referrerEmail,
                refereeName,
                refereeEmail,
            },
        });
        // Send email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: refereeEmail,
            subject: 'Course Referral',
            text: `Hi ${refereeName},\n\n${referrerName} has referred you to a course!\n\nBest regards,\nYour Company`,
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error:', error);
                return res.status(500).json({ error: 'Failed to send email' });
            }
            console.log('Email sent: ' + info.response);
            res.status(200).json(referral);
        });
    }
    catch (error) {
        console.error('Database Error:', error);
        res.status(500).json({ error: 'Failed to save referral data' });
    }
}));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
