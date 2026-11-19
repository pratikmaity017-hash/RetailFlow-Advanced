export function getIntegrationTest(req, res) {
  return res.status(200).json({
    success: true,
    message: "Core authentication and organization verification successful.",
    data: {
      user: req.auth,
      organization: req.organization,
      membership: req.membership,
    },
  });
}
