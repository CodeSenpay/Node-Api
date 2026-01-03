import { SchedulingModel } from "../models/scheduling-models/scheduling-model.js";

const models = Object.freeze({
  schedulesModel: SchedulingModel,
});

const errorResponse = (res, status, message, details) => {
  const response = { error: message };
  if (details) response.details = details;
  return res.status(status).json(response);
};

const handle_schedule = async (req, res) => {
  try {
    const { model, function_name, payload } = req.body;

    if (!model || !function_name) {
      return errorResponse(res, 400, "Missing model or function_name");
    }

    if (typeof model !== "string" || typeof function_name !== "string") {
      return errorResponse(res, 400, "model and function_name must be strings");
    }

    const ctrl = models[model];
    if (!ctrl) {
      return errorResponse(res, 404, `Model "${model}" not found`);
    }

    const fn = ctrl[function_name];
    if (typeof fn !== "function") {
      return errorResponse(
        res,
        404,
        `Function "${function_name}" not found in model "${model}"`
      );
    }

    const result = await fn(payload, req);

    if (!res.headersSent) {
      res.status(200).json({ success: true, data: result });
    }
  } catch (err) {
    console.error("Schedule Controller Error:", err);
    errorResponse(res, 500, "Internal server error", err?.message);
  }
};

export { handle_schedule };
