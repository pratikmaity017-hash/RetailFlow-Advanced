import {
  CoreApiError,
  requestCoreServiceApi,
} from "../../../integration/core-api/core-api.client.js";

function validateAmount(value, field) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new CoreApiError(
      `Core reporting data contains an invalid ${field}.`,
      502,
      "INVALID_PROFIT_REPORTING_DATA",
    );
  }

  return value;
}

function validateCount(value, field) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new CoreApiError(
      `Core reporting data contains an invalid ${field}.`,
      502,
      "INVALID_PROFIT_REPORTING_DATA",
    );
  }

  return value;
}

function calculateMargin(profitPaise, salesPaise) {
  if (salesPaise <= 0) {
    return 0;
  }

  return Number(((profitPaise / salesPaise) * 100).toFixed(2));
}

function getProductKey(product) {
  if (!product?.productId) {
    throw new CoreApiError(
      "Core reporting data contains a product without an ID.",
      502,
      "INVALID_PROFIT_REPORTING_DATA",
    );
  }

  return `${product.productId}:${product.variantId || "none"}`;
}

function mergeProducts(salesProducts, returnProducts) {
  const productsMap = new Map();

  for (const item of salesProducts) {
    const key = getProductKey(item);

    productsMap.set(key, {
      productId: item.productId,
      variantId: item.variantId || null,
      productName: item.productName || "Unknown product",
      sku: item.sku || null,
      quantitySold: validateCount(item.quantitySold, "quantitySold"),
      returnedQuantity: 0,
      grossSalesPaise: validateAmount(
        item.grossSalesPaise,
        "product grossSalesPaise",
      ),
      returnAmountPaise: 0,
      grossCogsPaise: validateAmount(
        item.grossCogsPaise,
        "product grossCogsPaise",
      ),
      returnedCogsPaise: 0,
    });
  }

  for (const item of returnProducts) {
    const key = getProductKey(item);

    const existing = productsMap.get(key) || {
      productId: item.productId,
      variantId: item.variantId || null,
      productName: item.productName || "Unknown product",
      sku: item.sku || null,
      quantitySold: 0,
      returnedQuantity: 0,
      grossSalesPaise: 0,
      returnAmountPaise: 0,
      grossCogsPaise: 0,
      returnedCogsPaise: 0,
    };

    existing.returnedQuantity = validateCount(
      item.returnedQuantity,
      "returnedQuantity",
    );

    existing.returnAmountPaise = validateAmount(
      item.returnAmountPaise,
      "product returnAmountPaise",
    );

    existing.returnedCogsPaise = validateAmount(
      item.returnedCogsPaise,
      "product returnedCogsPaise",
    );

    productsMap.set(key, existing);
  }

  return [...productsMap.values()]
    .map((product) => {
      const netQuantity = product.quantitySold - product.returnedQuantity;

      const netSalesPaise = product.grossSalesPaise - product.returnAmountPaise;

      const netCogsPaise = product.grossCogsPaise - product.returnedCogsPaise;

      const grossProfitPaise = netSalesPaise - netCogsPaise;

      return {
        ...product,
        netQuantity,
        netSalesPaise,
        netCogsPaise,
        grossProfitPaise,
        grossProfitMargin: calculateMargin(grossProfitPaise, netSalesPaise),
      };
    })
    .sort((a, b) => b.grossProfitPaise - a.grossProfitPaise);
}

function mergeTrends(salesTrends, returnTrends) {
  const trendsMap = new Map();

  for (const item of salesTrends) {
    if (
      typeof item.date !== "string" ||
      !Number.isFinite(Date.parse(item.date))
    ) {
      throw new CoreApiError(
        "Core reporting data contains an invalid sales trend date.",
        502,
        "INVALID_PROFIT_REPORTING_DATA",
      );
    }

    trendsMap.set(item.date, {
      date: item.date,
      grossSalesPaise: validateAmount(
        item.grossSalesPaise,
        "trend grossSalesPaise",
      ),
      returnAmountPaise: 0,
      grossCogsPaise: validateAmount(
        item.grossCogsPaise,
        "trend grossCogsPaise",
      ),
      returnedCogsPaise: 0,
      quantitySold: validateCount(item.quantitySold, "trend quantitySold"),
      returnedQuantity: 0,
    });
  }

  for (const item of returnTrends) {
    if (
      typeof item.date !== "string" ||
      !Number.isFinite(Date.parse(item.date))
    ) {
      throw new CoreApiError(
        "Core reporting data contains an invalid return trend date.",
        502,
        "INVALID_PROFIT_REPORTING_DATA",
      );
    }

    const existing = trendsMap.get(item.date) || {
      date: item.date,
      grossSalesPaise: 0,
      returnAmountPaise: 0,
      grossCogsPaise: 0,
      returnedCogsPaise: 0,
      quantitySold: 0,
      returnedQuantity: 0,
    };

    existing.returnAmountPaise = validateAmount(
      item.returnAmountPaise,
      "trend returnAmountPaise",
    );

    existing.returnedCogsPaise = validateAmount(
      item.returnedCogsPaise,
      "trend returnedCogsPaise",
    );

    existing.returnedQuantity = validateCount(
      item.returnedQuantity,
      "trend returnedQuantity",
    );

    trendsMap.set(item.date, existing);
  }

  return [...trendsMap.values()]
    .map((item) => {
      const netSalesPaise = item.grossSalesPaise - item.returnAmountPaise;

      const netCogsPaise = item.grossCogsPaise - item.returnedCogsPaise;

      const grossProfitPaise = netSalesPaise - netCogsPaise;

      return {
        ...item,
        netSalesPaise,
        netCogsPaise,
        netQuantity: item.quantitySold - item.returnedQuantity,
        grossProfitPaise,
        grossProfitMargin: calculateMargin(grossProfitPaise, netSalesPaise),
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getProfitAnalysis({ organizationId, from, to }) {
  if (!organizationId) {
    throw new CoreApiError(
      "Organization ID is required.",
      400,
      "ORGANIZATION_ID_REQUIRED",
    );
  }

  const query = new URLSearchParams({ from, to });

  const path =
    `/internal/v1/organizations/${encodeURIComponent(organizationId)}` +
    `/profit-reporting-data?${query.toString()}`;

  const response = await requestCoreServiceApi(path, {
    method: "GET",
    timeoutMs: 15000,
  });

  if (!response.ok) {
    const upstreamError = response.data?.error || response.data;

    const statusCode =
      response.status >= 400 && response.status < 500 ? response.status : 502;

    throw new CoreApiError(
      statusCode === 502
        ? "Core Profit Reporting service is currently unavailable."
        : upstreamError?.message || "Unable to retrieve profit reporting data.",
      statusCode,
      upstreamError?.code || "CORE_PROFIT_REPORTING_FAILED",
    );
  }

  const reportingData = response.data?.data;

  if (
    response.data?.success !== true ||
    !reportingData?.filters ||
    !reportingData?.sales?.summary ||
    !reportingData?.returns?.summary ||
    !Array.isArray(reportingData.sales.trends) ||
    !Array.isArray(reportingData.returns.trends) ||
    !Array.isArray(reportingData.sales.products) ||
    !Array.isArray(reportingData.returns.products)
  ) {
    throw new CoreApiError(
      "Core API returned invalid profit reporting data.",
      502,
      "INVALID_CORE_PROFIT_REPORTING_DATA",
    );
  }

  const sales = reportingData.sales.summary;
  const returns = reportingData.returns.summary;

  const grossSalesPaise = validateAmount(
    sales.grossSalesPaise,
    "grossSalesPaise",
  );

  const grossCogsPaise = validateAmount(sales.grossCogsPaise, "grossCogsPaise");

  const returnAmountPaise = validateAmount(
    returns.returnAmountPaise,
    "returnAmountPaise",
  );

  const returnedCogsPaise = validateAmount(
    returns.returnedCogsPaise,
    "returnedCogsPaise",
  );

  const quantitySold = validateCount(sales.quantitySold, "quantitySold");

  const returnedQuantity = validateCount(
    returns.returnedQuantity,
    "returnedQuantity",
  );

  const netSalesPaise = grossSalesPaise - returnAmountPaise;
  const netCogsPaise = grossCogsPaise - returnedCogsPaise;
  const grossProfitPaise = netSalesPaise - netCogsPaise;

  return {
    filters: reportingData.filters,

    summary: {
      grossSalesPaise,
      returnAmountPaise,
      netSalesPaise,

      grossCogsPaise,
      returnedCogsPaise,
      netCogsPaise,

      grossProfitPaise,
      grossProfitMargin: calculateMargin(grossProfitPaise, netSalesPaise),

      quantitySold,
      returnedQuantity,
      netQuantity: quantitySold - returnedQuantity,

      saleItemCount: validateCount(sales.saleItemCount, "saleItemCount"),

      returnItemCount: validateCount(
        returns.returnItemCount,
        "returnItemCount",
      ),
    },

    trends: mergeTrends(
      reportingData.sales.trends,
      reportingData.returns.trends,
    ),

    products: mergeProducts(
      reportingData.sales.products,
      reportingData.returns.products,
    ),
  };
}
