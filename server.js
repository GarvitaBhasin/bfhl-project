const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

const OFFICIAL_EMAIL = process.env.OFFICIAL_EMAIL;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;


app.get("/health", (req, res) => {
  res.status(200).json({
    is_success: true,
    official_email: OFFICIAL_EMAIL
  });
});


app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body;

    if (!body || Object.keys(body).length !== 1) {
      return res.status(400).json({
        is_success: false,
        error: "Request must contain exactly one key"
      });
    }

    const key = Object.keys(body)[0];
    const value = body[key];

    let result;

   
    if (key === "fibonacci") {
      if (typeof value !== "number" || value < 0) {
        return res.status(400).json({
          is_success: false,
          error: "Fibonacci input must be a non-negative integer"
        });
      }

      let fib = [0, 1];
      for (let i = 2; i <= value; i++) {
        fib.push(fib[i - 1] + fib[i - 2]);
      }
      result = fib.slice(0, value + 1);
    }

    
  
    else if (key === "prime") {
      if (!Array.isArray(value)) {
        return res.status(400).json({
          is_success: false,
          error: "Prime input must be an array"
        });
      }

      const isPrime = (n) => {
        if (n < 2) return false;
        for (let i = 2; i * i <= n; i++) {
          if (n % i === 0) return false;
        }
        return true;
      };

      result = value.filter(isPrime);
    }


    else if (key === "lcm") {
      if (!Array.isArray(value)) {
        return res.status(400).json({
          is_success: false,
          error: "LCM input must be an array"
        });
      }

      const gcd = (a, b) => (!b ? a : gcd(b, a % b));
      const lcm = (a, b) => (a * b) / gcd(a, b);

      result = value.reduce((acc, num) => lcm(acc, num));
    }

    
    else if (key === "hcf") {
      if (!Array.isArray(value)) {
        return res.status(400).json({
          is_success: false,
          error: "HCF input must be an array"
        });
      }

      const gcd = (a, b) => (!b ? a : gcd(b, a % b));
      result = value.reduce((acc, num) => gcd(acc, num));
    }

 
    else if (key === "AI") {
      if (typeof value !== "string") {
        return res.status(400).json({
          is_success: false,
          error: "AI input must be a string question"
        });
      }

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: value }] }]
        }
      );

      result = response.data.candidates[0].content.parts[0].text.split(" ")[0];
    }

    else {
      return res.status(400).json({
        is_success: false,
        error: "Invalid key"
      });
    }

    res.status(200).json({
      is_success: true,
      official_email: OFFICIAL_EMAIL,
      data: result
    });

  } catch (error) {
    res.status(500).json({
      is_success: false,
      error: "Internal Server Error"
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
