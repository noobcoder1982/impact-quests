const aiService = require('../services/ai.service');
const Task = require('../models/Task');
const User = require('../models/User');
const Inventory = require('../models/Inventory');
const { successResponse, errorResponse } = require('../utils/response.util');
const fs = require('fs');
const pdfParse = require('pdf-parse');

/**
 * AI Controller
 * Orchestrates product-grade intelligence features
 */

/**
 * @route   POST /api/v1/ai/analyze
 * @desc    Analyze incident report
 * @access  Private
 */
const analyzeReport = async (req, res) => {
  try {
    const { description } = req.body;
    if (!description) return errorResponse(res, 400, "Description is required");

    const analysis = await aiService.analyzeCrisisReport(description);
    return successResponse(res, 200, "Analysis complete", analysis);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

/**
 * @route   POST /api/v1/ai/generate-mission
 * @desc    Convert intelligence into actionable mission
 * @access  Private (NGO Only)
 */
const generateMission = async (req, res) => {
  try {
    const { description, source, manualLocation, durationHours } = req.body;
    if (!description) return errorResponse(res, 400, "Description is required");

    const analysis = await aiService.analyzeCrisisReport(description);
    const duration = durationHours || analysis.estimated_duration_hours || 4;
    const expiresAt = new Date(Date.now() + duration * 60 * 60 * 1000);

    const newTask = await Task.create({
      title: `${analysis.category || 'General'} Operation`,
      description: description,
      category: (analysis.category || 'other').toLowerCase(),
      urgency: (analysis.urgency || 'medium').toLowerCase(),
      status: 'open',
      location: manualLocation || analysis.location || { type: 'Point', coordinates: [0,0] },
      deadline: expiresAt,
      createdBy: req.user._id,
      metadata: {
        ai_analysis: analysis,
        source: source || 'Manual Intelligence Entry'
      }
    });

    return successResponse(res, 201, "Mission generated", newTask);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

/**
 * @route   GET /api/v1/ai/get-intelligence/:taskId
 * @desc    Get matching and resource intelligence for a task
 * @access  Private (NGO Only)
 */
const getTaskIntelligence = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) return errorResponse(res, 404, "Task not found");

    const volunteers = await User.find({ role: 'volunteer' }).limit(50);
    const inventory = await Inventory.find({ status: 'Ready' }).limit(50);

    const [suggestedTeam, recommendedInventory] = await Promise.all([
      aiService.matchVolunteersForTask(task, volunteers),
      aiService.recommendInventoryForTask(task, inventory)
    ]);

    return successResponse(res, 200, "Intelligence retrieved", { suggestedTeam, recommendedInventory });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

/**
 * @route   POST /api/v1/ai/chat
 * @desc    Unified Mission Assistant
 * @access  Private
 */
const chat = async (req, res) => {
  try {
    const { message, context } = req.body;
    if (!message) return errorResponse(res, 400, "Message is required");

    const user = await User.findById(req.user._id).select('name role skills level points');
    const [activeTasks, inventorySummary] = await Promise.all([
      Task.find({ status: { $ne: 'completed' } }).limit(10),
      Inventory.find({}).limit(15)
    ]);

    const enrichedContext = {
      ...context,
      user,
      site_intelligence: {
        active_missions: activeTasks,
        inventory_status: inventorySummary,
        timestamp: new Date().toISOString()
      }
    };

    const aiResponse = await aiService.handleChat(message, enrichedContext);
    return successResponse(res, 200, "Message processed", aiResponse);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

/**
 * @route   POST /api/v1/ai/summarize
 * @desc    Generate smart summaries for activity/reports
 * @access  Private
 */
const getSummary = async (req, res) => {
  try {
    const { data, type } = req.body;
    const summary = await aiService.summarizeActivity(data, type);
    return successResponse(res, 200, "Summary generated", summary);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

/**
 * @route   POST /api/v1/ai/copilot
 * @desc    Admin Copilot support
 * @access  Private (NGO Only)
 */
const getCopilotAssistance = async (req, res) => {
  try {
    const { request, context } = req.body;
    const assistance = await aiService.assistAdmin(request, context);
    return successResponse(res, 200, "Copilot support ready", assistance);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

/**
 * @route   GET /api/v1/ai/dashboard-intelligence
 * @desc    Strategic resource and mission insights
 * @access  Private (NGO Only)
 */
const getDashboardIntelligence = async (req, res) => {
  try {
    const tasks = await Task.find({ status: 'open' });
    const inventory = await Inventory.find({});
    const dashboardInsights = await aiService.generateDashboardInsights(tasks, inventory);
    return successResponse(res, 200, "Insights generated", dashboardInsights);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

/**
 * @route   POST /api/v1/ai/parse-document
 * @desc    Ingest document and generate intelligence
 * @access  Private
 */
const parseDocument = async (req, res) => {
  try {
    if (!req.file) return errorResponse(res, 400, 'No document provided');

    let extractedText = "";
    if (req.file.mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(req.file.path);
      const data = await pdfParse(dataBuffer);
      extractedText = data.text;
    } else {
      extractedText = fs.readFileSync(req.file.path, 'utf8');
    }

    fs.unlinkSync(req.file.path);
    const intelligence = await aiService.analyzeCrisisReport(`Document Context: ${extractedText.substring(0, 5000)}`);

    return successResponse(res, 200, "Document parsed", intelligence);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

module.exports = {
  analyzeReport,
  generateMission,
  getTaskIntelligence,
  chat,
  getSummary,
  getCopilotAssistance,
  getDashboardIntelligence,
  parseDocument
};
