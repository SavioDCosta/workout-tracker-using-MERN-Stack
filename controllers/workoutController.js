const mongoose = require("mongoose");
const workoutModel = require("../models/workoutModel");
const workoutPlanModel = require("../models/workoutPlanModel");

const workoutController = {
  // get all workouts
  getAllWorkouts: async (req, res) => {
    try {
      const workouts = await workoutModel
        .find({})
        .populate("exercises.exerciseId")
        .sort({ createdAt: -1 });
      return res.status(200).json(workouts);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  // get a single workout
  getWorkout: async (req, res) => {
    // checks if id parameter is valid or not
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(404).json({ error: "Workout not found" });
      }
      const workout = await workoutModel
        .findById(req.params.id)
        .populate("exercises.exerciseId");
      if (!workout) {
        return res.status(404).json({ error: "Workout not found" });
      }
      return res.status(200).json(workout);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  // create a new workout
  createWorkout: async (req, res) => {
    try {
      const workout = new workoutModel(req.body);
      await workout.save();
      return res.status(200).json(workout);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  // update a workout
  updateWorkout: async (req, res) => {
    try {
      // checks if id parameter is valid or not
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(404).json({ error: "Workout not found" });
      }
      const workout = await workoutModel.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!workout) {
        return res.status(404).json({ error: "Workout not found" });
      }
      return res.status(200).json(workout);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  // delete a workout
  deleteWorkout: async (req, res) => {
    try {
      // checks if id parameter is valid or not
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(404).json({ error: "Workout not found" });
      }
      const workout = await workoutModel.findByIdAndDelete(req.params.id);
      if (!workout) {
        return res.status(404).json({ error: "Workout not found" });
      }
      /* 
        Updating Workout Plans: 
            In both the middleware and manual routine, Workout.updateMany() is used to update all workout documents.
        The $pull Operator: 
            This operator removes from the exercises array any subdocument 
            where the exerciseId matches the ID of the deleted exercise.
        Empty Query Object {}: 
            This is used in updateMany() to target all workout documents in the collection.
      */
      await workoutPlanModel.updateMany(
        {},
        {
          $pull: {
            workouts: { workoutId: new mongoose.Types.ObjectId(workout.id) },
          },
        }
      );
      return res.status(200).json(workout);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
};

module.exports = workoutController;
