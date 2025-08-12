import React, { useMemo, useState } from "react";
import "./Dashboard.css";
import { Link } from "react-router-dom";
import { Box, SimpleGrid, HStack, Text, Badge, Button } from "@chakra-ui/react";

function formatCurrency(amount) {
  const formatter = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  const parts = formatter.formatToParts(amount);

  // If currency appears first without an intervening literal (e.g., "US$48,200"),
  // insert a space between currency and the numeric portion.
  if (
    parts.length > 1 &&
    parts[0].type === "currency" &&
    parts[1].type !== "literal"
  ) {
    return `${parts[0].value} ${parts
      .slice(1)
      .map((p) => p.value)
      .join("")}`;
  }

  const formatted = parts.map((p) => p.value).join("");
  // Fallback: add a space after the last non-digit, non-space char when immediately followed by a digit.
  return formatted.replace(/([^\d\s])(?=\d)/, "$1 ");
}

function formatHours(hours) {
  return Number(hours).toLocaleString(undefined, { maximumFractionDigits: 1 });
}

function IconShield() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2l7 3v6c0 5-3.5 9.4-7 11-3.5-1.6-7-6-7-11V5l7-3z"
      />
    </svg>
  );
}

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 5h-2v6l5 3 .9-1.5L13 12V7z"
      />
    </svg>
  );
}

function IconWrench() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="currentColor"
        d="M22 7.2l-5.2 5.2-2.2-2.2L19.8 5a6 6 0 11-9 7.2l-7 7L2 22l7-7A6 6 0 0019 5l3 2.2z"
      />
    </svg>
  );
}

function IconChart() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="currentColor"
        d="M4 22h16v-2H4V4H2v18h2zm4-4h3V10H8v8zm5 0h3V6h-3v12zm5 0h3V13h-3v5z"
      />
    </svg>
  );
}

function IconAlert() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="currentColor"
        d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2V9h2v5z"
      />
    </svg>
  );
}

function TrendChip({ direction, percent }) {
  const isUp = direction === "up";
  const bg = isUp ? "green.50" : "red.50";
  const color = isUp ? "green.600" : "red.600";
  const sign = isUp ? "+" : "-";
  const arrow = isUp ? "↗" : "↘";
  return (
    <Badge
      bg={bg}
      color={color}
      px={2.5}
      py={1}
      rounded="full"
      fontWeight="700"
      display="inline-flex"
      alignItems="center"
      gap={1.5}
    >
      <span aria-hidden="true">{arrow}</span>
      {`${sign}${percent}%`}
    </Badge>
  );
}

function AlertBanner({
  message,
  onClose,
  actionTo = "/action",
  actionLabel = "Take Action",
}) {
  const border = "orange.200";
  const bg = "orange.50";
  const iconBg = "orange.100";
  return (
    <HStack
      role="alert"
      spacing={3}
      borderWidth="1px"
      borderColor={border}
      bg={bg}
      rounded="lg"
      p={3.5}
    >
      <Box rounded="full" bg={iconBg} p={1.5} color="orange.500">
        <IconAlert />
      </Box>
      <Text flex="1" fontSize="sm">
        {message}
      </Text>
      <HStack spacing={2}>
        <Button
          as={Link}
          to={actionTo}
          state={{ initialText: message }}
          colorScheme="blue"
          size="sm"
          fontWeight="700"
        >
          {actionLabel}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          aria-label="Dismiss alert"
        >
          Dismiss
        </Button>
      </HStack>
    </HStack>
  );
}

function InsightPopup({ onClose, actionTo = "/action" }) {
  return (
    <Box position="fixed" right={{ base: 4, md: 8 }} bottom={{ base: 4, md: 8 }} zIndex={50}>
      {/* Outer white card */}
      <Box
        position="relative"
        bg="white"
        rounded="3xl"
        boxShadow="2xl"
        p={{ base: 2, md: 3 }}
        width={{ base: "calc(100vw - 32px)", sm: "420px", md: "520px" }}
        maxW="560px"
      >
        {/* Inner panel with dotted border */}
        <Box
          bg="#eef2ff"
          rounded="2xl"
          borderWidth="2px"
          borderStyle="dotted"
          borderColor="#c7d2fe"
          p={{ base: 4, md: 6 }}
        >
          <HStack align="start" spacing={3} mb={2}>
            <Box color="#4f46e5" aria-hidden="true" mt={1}>
              <svg width="22" height="22" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 2l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5z" />
              </svg>
            </Box>
            <Box>
              <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="900" letterSpacing="-0.02em" lineHeight="1.1">
                Your maintenance costs are up 7%{' '}
                <Text as="span" fontSize={{ base: "lg", md: "xl" }} color="gray.700" fontWeight="800">
                  ($450 annualized)
                </Text>
              </Text>
            </Box>
          </HStack>
          <Text mt={{ base: 2, md: 3 }} color="gray.600" fontSize={{ base: "lg", md: "xl" }} fontWeight="700">
            Dive in?
          </Text>
          <HStack mt={{ base: 4, md: 6 }} spacing={3}>
            <Button as={Link} to={actionTo} colorScheme="blue" fontWeight="800" size="lg">
              Explore Now
            </Button>
            <Button variant="outline" bg="white" borderColor="#e5e7eb" onClick={onClose} fontWeight="800" size="lg">
              Later
            </Button>
          </HStack>
        </Box>

        {/* Decorative sparkle chip on the outer corner */}
        <Box
          position="absolute"
          right={{ base: -3, md: -4 }}
          bottom={{ base: -3, md: -4 }}
          w={{ base: 10, md: 12 }}
          h={{ base: 10, md: 12 }}
          bg="white"
          rounded="full"
          boxShadow="xl"
          display="grid"
          placeItems="center"
        >
          <Box color="#4f46e5">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 2l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5z" />
            </svg>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function Sparkline({ data, color }) {
  const width = 120;
  const height = 28;
  const padding = 2;

  const points = useMemo(() => {
    if (!data || data.length === 0) return "";
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = Math.max(1, max - min);
    return data
      .map((value, index) => {
        const x = padding + (index / (data.length - 1)) * (width - padding * 2);
        const y =
          padding + (1 - (value - min) / range) * (height - padding * 2);
        return `${x},${y}`;
      })
      .join(" ");
  }, [data]);

  return (
    <svg
      className="sparkline"
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      aria-hidden="true"
    >
      <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
    </svg>
  );
}

function KpiCard({
  title,
  Icon,
  value,
  unit,
  subtitle,
  accent,
  trendPercent,
  trendDirection,
  sparklineData,
  sparklineColor,
  progressPercent,
}) {
  const cardBg = "white";
  const border = "gray.200";
  const accentBg = {
    "accent-safety": "orange.50",
    "accent-downtime": "blue.50",
    "accent-cost": "gray.100",
    "accent-productivity": "green.50",
  }[accent];
  const accentColor = {
    "accent-safety": "orange.500",
    "accent-downtime": "blue.500",
    "accent-cost": "gray.600",
    "accent-productivity": "green.600",
  }[accent];

  return (
    <Box
      role="region"
      aria-label={title}
      bg={cardBg}
      borderWidth="1px"
      borderColor={border}
      rounded="2xl"
      p={4}
      minH="140px"
      boxShadow="sm"
      _hover={{ boxShadow: "md", transform: "translateY(-2px)" }}
      transition="all 0.12s ease"
    >
      <HStack spacing={3} mb={3} align="center">
        <Box
          w={8}
          h={8}
          rounded="full"
          bg={accentBg}
          color={accentColor}
          display="grid"
          placeItems="center"
        >
          <Icon />
        </Box>
        <Text fontWeight="700">{title}</Text>
      </HStack>

      <HStack justify="space-between" align="start">
        <Box>
          <HStack align="baseline" spacing={2}>
            <Text fontSize="2xl" fontWeight="800" letterSpacing="-0.02em">
              {value}
            </Text>
            {unit ? (
              <Text fontSize="xs" color="gray.500">
                {unit}
              </Text>
            ) : null}
          </HStack>
          {subtitle ? (
            <Text mt={1} fontSize="sm" color="gray.500">
              {subtitle}
            </Text>
          ) : null}
        </Box>
        <TrendChip direction={trendDirection} percent={trendPercent} />
      </HStack>

      {typeof progressPercent === "number" ? (
        <Box
          mt={2}
          h="4px"
          bg="#f3f4f6"
          rounded="full"
          overflow="hidden"
          aria-label={`${title} progress`}
        >
          <Box h="100%" width={`${progressPercent}%`} bg="#22c55e" />
        </Box>
      ) : null}

      {sparklineData && sparklineData.length ? (
        <Box mt={2}>
          <Sparkline data={sparklineData} color={sparklineColor} />
        </Box>
      ) : null}

      <Box mt={2} borderTopWidth="1px" borderColor={border} />
    </Box>
  );
}

export default function Dashboard() {
  const [timeframe, setTimeframe] = useState("6M");
  const [product, setProduct] = useState("All");
  const [plant, setPlant] = useState("1000 - Hamburg");
  const [showOpexAlert, setShowOpexAlert] = useState(true);
  const [showInsightPopup, setShowInsightPopup] = useState(true);

  const base = useMemo(
    () => ({
      safety: {
        count: 2,
        trendPercent: 12,
        trendDirection: "down",
        spark: [6, 5, 4, 3, 4, 3, 2],
      },
      downtime: {
        hours: 14.5,
        trendPercent: 8,
        trendDirection: "up",
        spark: [1, 2, 1.8, 2.4, 2.2, 2.6, 2.9],
      },
      cost: {
        usd: 48200,
        trendPercent: 4,
        trendDirection: "up",
        spark: [30, 32, 34, 35, 36, 38, 40],
      },
      productivity: {
        rate: 92,
        trendPercent: 3,
        trendDirection: "up",
        spark: [86, 88, 87, 89, 90, 91, 92],
      },
    }),
    []
  );

  const metrics = useMemo(() => {
    const multipliers = { Week: 0.25, Month: 1, Quarter: 3 };
    const m = multipliers[timeframe] ?? 1;
    return {
      safety: {
        ...base.safety,
        count: Math.max(0, Math.round(base.safety.count * m)),
      },
      downtime: {
        ...base.downtime,
        hours: Number((base.downtime.hours * m).toFixed(1)),
      },
      cost: { ...base.cost, usd: Math.round(base.cost.usd * m) },
      productivity: base.productivity,
    };
  }, [base, timeframe]);

  const pagePad = { base: 5, md: 8 };
  const maxW = "1280px";
  return (
    <Box as="main" className="dashboard-container" px={pagePad}>
      {/* Filters row (moved from header) */}
      <Box maxW={maxW} mx="auto" mb={4}>
        <HStack className="header-filters" justify="space-between">
          <HStack className="filters-left">
            <div className="field">
              <label htmlFor="product" className="field-label">
                Product
              </label>
              <select
                id="product"
                className="field-select"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
              >
                <option>All</option>
                <option>Maintenance</option>
                <option>Operations</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="plant" className="field-label">
                Plant
              </label>
              <select
                id="plant"
                className="field-select"
                value={plant}
                onChange={(e) => setPlant(e.target.value)}
              >
                <option>1000 - Hamburg</option>
              </select>
            </div>
            <div className="timeframes" role="tablist" aria-label="Timeframes">
              <button
                className={`chip ${timeframe === "30D" ? "chip-active" : ""}`}
                role="tab"
                aria-selected={timeframe === "30D"}
                onClick={() => setTimeframe("30D")}
              >
                30D
              </button>
              <button
                className={`chip ${timeframe === "3M" ? "chip-active" : ""}`}
                role="tab"
                aria-selected={timeframe === "3M"}
                onClick={() => setTimeframe("3M")}
              >
                3M
              </button>
              <button
                className={`chip ${timeframe === "6M" ? "chip-active" : ""}`}
                role="tab"
                aria-selected={timeframe === "6M"}
                onClick={() => setTimeframe("6M")}
              >
                6M
              </button>
              <button className="chip" role="tab" aria-selected={false}>
                Custom
              </button>
            </div>
          </HStack>
          {/* <HStack className="filters-right">
            <button className="icon-btn" aria-label="Export PDF" title="Export PDF">
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm0 2.5L19.5 10H14V4.5zM8 13h3a2 2 0 1 1 0 4H9v2H8v-6zm1 1v2h2a1 1 0 1 0 0-2H9zm6 5h-1v-6h3a1.5 1.5 0 0 1 0 3h-2v3zm0-4h2a.5.5 0 0 0 0-1h-2v1z"
                />
              </svg>
            </button> */}
          {/* <button className="icon-btn" aria-label="Share via email" title="Share via email">
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4l-8 5L4 8V6l8 5 8-5v2z"
                />
              </svg>
            </button> */}
          {/* </HStack> */}
        </HStack>
      </Box>
      {/* <HStack
        className="dashboard-toolbar"
        justify="space-between"
        maxW={maxW}
        mx="auto"
        mb={4}
        align="end"
      > */}
      {/* <Box>
          <Text
            as="h1"
            fontSize="2xl"
            fontWeight="800"
            mb={1}
            letterSpacing="-0.02em"
          >
            Maintenance Dashboard
          </Text>
          <Text className="dashboard-subtitle" fontSize="sm" color="gray.500">
            Live snapshot of key metrics
          </Text>
        </Box> */}
      {/* <HStack spacing={3}>
          <label className="sr-only" htmlFor="timeframe">
            Timeframe
          </label>
          <select
            id="timeframe"
            className="timeframe-select"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
          >
            <option>Week</option>
            <option>Month</option>
            <option>Quarter</option>
          </select>
          <Button
            className="btn"
            onClick={() => window.location.reload()}
            size="sm"
          >
            Refresh
          </Button>
        </HStack> */}
      {/* </HStack> */}

      {/* {showOpexAlert && (
        <Box className="dashboard-alerts" maxW={maxW} mx="auto" mb={4}>
          <AlertBanner
            message={
              "I can see increase in OPEX from last 3 months. Lets find RCA and resolve this issue."
            }
            onClose={() => setShowOpexAlert(false)}
          />
        </Box>
      )} */}

      <Box aria-label="Key performance indicators" maxW={maxW} mx="auto">
        <SimpleGrid
          columns={{ base: 1, md: 2 }}
          columnGap={{ base: 5, md: 5, lg: 5 }}
          rowGap={{ base: 5, md: 5, lg: 5 }}
        >
          <KpiCard
            title="Safety Incidents"
            Icon={IconShield}
            value={metrics.safety.count}
            unit="this period"
            subtitle="Lower is better"
            accent="accent-safety"
            trendPercent={metrics.safety.trendPercent}
            trendDirection={metrics.safety.trendDirection}
            sparklineData={metrics.safety.spark}
            sparklineColor="#ea580c"
          />
          <KpiCard
            title="Asset Downtime"
            Icon={IconClock}
            value={formatHours(metrics.downtime.hours)}
            unit="hours"
            subtitle="Total across critical assets"
            accent="accent-downtime"
            trendPercent={metrics.downtime.trendPercent}
            trendDirection={metrics.downtime.trendDirection}
            sparklineData={metrics.downtime.spark}
            sparklineColor="#2563eb"
          />
          <KpiCard
            title="Maintenance Cost"
            Icon={IconWrench}
            value={formatCurrency(metrics.cost.usd)}
            unit=""
            subtitle="Material + labor"
            accent="accent-cost"
            trendPercent={metrics.cost.trendPercent}
            trendDirection={metrics.cost.trendDirection}
            sparklineData={metrics.cost.spark}
            sparklineColor="#6b7280"
          />
          <KpiCard
            title="Productivity"
            Icon={IconChart}
            value={`${metrics.productivity.rate}%`}
            unit="rate"
            subtitle="Output vs capacity"
            accent="accent-productivity"
            trendPercent={metrics.productivity.trendPercent}
            trendDirection={metrics.productivity.trendDirection}
            sparklineData={metrics.productivity.spark}
            sparklineColor="#059669"
            progressPercent={metrics.productivity.rate}
          />
        </SimpleGrid>
      </Box>
      {showInsightPopup && (
        <InsightPopup onClose={() => setShowInsightPopup(false)} />
      )}
    </Box>
  );
}
