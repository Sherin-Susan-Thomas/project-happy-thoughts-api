import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/project-mongo";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());
///
const ThoughtSchema = new mongoose.Schema({
  name: {
    type: String,
    default: "unknown",
    //to delete the whitespace
    trim: true,
  },
  hearts: {
    type: Number,
    default: 0,
  },
  message: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 140,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: () => new Date(),
  },
});

const Thoughts = mongoose.model("Thoughts", ThoughtSchema);
// Start defining your routes here
app.get("/", (req, res) => {
  const WelcomePage = {
    Hello: "Welcome to Happy Thoughts API",
    Routes: [
      {
        "/thoughts": "Get the thoughts added",
      },
    ],
  };
  res.send(WelcomePage);
});
app.get("/thoughts", async (req, res) => {
  try {
    const thoughts = await Thoughts.find()
      .sort({ createdAt: "desc" })
      .limit(20)
      .exec();
    res.status(200).json(thoughts);
  } catch (err) {
    res.status(400).json({
      success: false,
      response: "Bad request, couldnot fetch thoughts.",
    });
  }
});
//POST request
app.post("/thoughts", async (req, res) => {
  const { message } = req.body;
  const createdAt = new Date(
    new Date(Date.now()).toLocaleString("sv-SE", {
      timeZone: "Europe/Stockholm",
    })
  );
  try {
    const newThoughts = await new Thoughts({
      message,
      createdAt,
    }).save();
    res.status(201).json({ response: newThoughts, success: true });
  } catch (error) {
    res.status(400).json({
      success: false,
      response: "Bad request, couldnot save new thoughts.",
    });
  }
});
app.post("/thoughts/:thoughtId/like", async (req, res) => {
  const { thoughtId } = req.params;

  try {
    const thoughtsToLike = await Thoughts.findByIdAndUpdate(thoughtId, {
      $inc: { hearts: 1 },
    });
    res.status(201).json(thoughtsToLike);
  } catch (err) {
    res.status(400).json({
      success: false,
      status_code: 400,
      message: "Bad request, could not find and update the thought.Try again!",
      error: err.errors,
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
