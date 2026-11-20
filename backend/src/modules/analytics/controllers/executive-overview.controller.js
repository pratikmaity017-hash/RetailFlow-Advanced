import { validateExecutiveOverviewQuery } from "../validators/executive-overview.validator.js";

import { getExecutiveOverview } from "../services/executive-overview.service.js";

export async function getExecutiveOverviewController(req, res, next) {
  try {
    const filters = validateExecutiveOverviewQuery(req.query);

    const data = await getExecutiveOverview({
      organizationId: req.organization.id,
      accessToken: req.coreAccessToken,
      ...filters,
    });

    return res.status(200).json({
      success: true,
      message: "Executive overview retrieved successfully.",
      data,
    });
  } catch (error) {
    return next(error);
  }
}
