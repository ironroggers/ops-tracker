import React, { useMemo, useState } from "react";
import "./Dashboard.css";
import { Link, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const message =
    "I can seen 17% increase in Maintenance Cost in the last 6 months!";
  return (
    <Box
      position="fixed"
      right={{ base: 4, md: 8 }}
      bottom={{ base: 4, md: 8 }}
      zIndex={50}
    >
      {/* Outer white card */}
      <Box
        position="relative"
        bg="white"
        rounded="3xl"
        boxShadow="2xl"
        p={{ base: 2, md: 3 }}
        width={{ base: "calc(100vw - 40px)", sm: "360px", md: "420px" }}
        maxW="440px"
      >
        {/* Inner panel with dotted border */}
        <Box
          bg="#eef2ff"
          rounded="2xl"
          borderWidth="2px"
          borderStyle="dotted"
          borderColor="#c7d2fe"
          p={{ base: 4, md: 5 }}
        >
          <HStack align="start" spacing={3} mb={2}>
            <Box color="#4f46e5" aria-hidden="true" mt={1}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
              >
                <path
                  d="M9.05059 16.1617C10.4292 17.4452 11.5413 19.7215 12.2154 21.3532C12.4567 21.9372 13.402 21.9372 13.6433 21.3532C14.3175 19.7215 15.4296 17.4452 16.8082 16.1617C18.0338 15.0206 20.0807 14.0957 21.5429 13.5322C22.112 13.3129 22.1549 12.4372 21.6073 12.1687C20.1446 11.4517 18.0602 10.3027 16.8082 9.05059C15.4888 7.73122 14.2839 5.48771 13.5782 4.0213C13.3275 3.5003 12.5312 3.5003 12.2805 4.0213C11.5749 5.48771 10.3699 7.73122 9.05059 9.05059C7.79851 10.3027 5.71412 11.4517 4.25148 12.1687C3.70382 12.4372 3.74677 13.3129 4.31589 13.5322C5.77809 14.0957 7.82494 15.0206 9.05059 16.1617Z"
                  fill="#3D5AFE"
                />
                <path
                  d="M21.3329 24.889C22.0222 25.5307 22.5783 26.6689 22.9153 27.4847C23.036 27.7767 23.5086 27.7767 23.6293 27.4847C23.9664 26.6689 24.5224 25.5307 25.2117 24.889C25.8245 24.3184 26.8479 23.856 27.579 23.5742C27.8636 23.4645 27.8851 23.0267 27.6113 22.8925C26.8799 22.534 25.8377 21.9594 25.2117 21.3334C24.552 20.6737 23.9495 19.552 23.5967 18.8188C23.4714 18.5583 23.0732 18.5583 22.9479 18.8188C22.5951 19.552 21.9926 20.6737 21.3329 21.3334C20.7069 21.9594 19.6647 22.534 18.9334 22.8925C18.6595 23.0267 18.681 23.4645 18.9656 23.5742C19.6967 23.856 20.7201 24.3184 21.3329 24.889Z"
                  fill="#3D5AFE"
                />
              </svg>
            </Box>
            <Box>
              <Text
                fontSize="16px"
                fontWeight="500"
                letterSpacing="-0.01em"
                lineHeight="1.2"
                color="#0b1220"
              >
                I can seen{" "}
                <Text as="span" fontWeight="800">
                  17% increase
                </Text>{" "}
                in Maintenance Cost in the last 6 months!
              </Text>
            </Box>
          </HStack>
          <Text
            mt={{ base: 2, md: 3 }}
            color="#475569"
            fontSize={{ base: "sm", md: "md" }}
            fontWeight="500"
            style={{ marginLeft: "11%" }}
          >
            Dive in?
          </Text>
          <HStack
            mt={{ base: 4, md: 5 }}
            spacing={3}
            style={{ marginLeft: "11%" }}
          >
            <Button
              onClick={() =>
                navigate(actionTo, { state: { initialText: message } })
              }
              bg="#3d5afe"
              color="white"
              _hover={{ bg: "#2f49ff" }}
              fontWeight="800"
              size="md"
              borderRadius="12px"
            >
              Explore Now
            </Button>
            <Button
              variant="outline"
              bg="white"
              borderColor="#e5e7eb"
              onClick={onClose}
              fontWeight="650"
              size="md"
              borderRadius="12px"
            >
              Later
            </Button>
          </HStack>
        </Box>

        {/* Decorative icon moved to a persistent component to avoid position jumping */}
      </Box>
    </Box>
  );
}

function InsightCornerIcon({ onOpen }) {
  return (
    <Box
      position="fixed"
      right={{ base: 4, md: 8 }}
      bottom={{ base: 4, md: 8 }}
      zIndex={40}
    >
      <Box
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onOpen?.();
        }}
        cursor="pointer"
        title="View insight"
      >
        <svg
          width="88"
          height="88"
          viewBox="0 0 116 116"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g filter="url(#insightIconShadowSolo)">
            <circle cx="58.2383" cy="58.2381" r="36.4551" fill="white" />
            <path
              d="M51.2272 58.9393C52.7222 60.3312 53.9282 62.7997 54.6593 64.5692C54.921 65.2025 55.9461 65.2025 56.2078 64.5692C56.9389 62.7997 58.1449 60.3312 59.6399 58.9393C60.9691 57.7018 63.1888 56.6988 64.7745 56.0877C65.3916 55.8498 65.4382 54.9002 64.8443 54.6091C63.2581 53.8315 60.9977 52.5854 59.6399 51.2276C58.2091 49.7968 56.9024 47.3638 56.1372 45.7736C55.8653 45.2086 55.0018 45.2086 54.7299 45.7736C53.9647 47.3638 52.658 49.7968 51.2272 51.2276C49.8694 52.5854 47.609 53.8315 46.0228 54.6091C45.4289 54.9002 45.4755 55.8498 46.0927 56.0877C47.6784 56.6988 49.8981 57.7018 51.2272 58.9393Z"
              fill="#3D5AFE"
            />
            <path
              d="M64.5477 68.4035C65.2952 69.0994 65.8982 70.3337 66.2638 71.2184C66.3946 71.5351 66.9071 71.5351 67.038 71.2184C67.4035 70.3337 68.0065 69.0994 68.754 68.4035C69.4186 67.7847 70.5285 67.2832 71.3213 66.9777C71.6299 66.8588 71.6532 66.384 71.3562 66.2384C70.5632 65.8496 69.433 65.2266 68.754 64.5476C68.0387 63.8323 67.3853 62.6158 67.0027 61.8206C66.8667 61.5381 66.435 61.5381 66.299 61.8206C65.9164 62.6158 65.2631 63.8323 64.5477 64.5476C63.8688 65.2266 62.7386 65.8496 61.9455 66.2384C61.6485 66.384 61.6718 66.8588 61.9804 66.9777C62.7733 67.2832 63.8831 67.7847 64.5477 68.4035Z"
              fill="#3D5AFE"
            />
          </g>
          <defs>
            <filter
              id="insightIconShadowSolo"
              x="7.76203"
              y="7.7619"
              width="100.953"
              height="100.953"
              filterUnits="userSpaceOnUse"
              color-interpolation-filters="sRGB"
            >
              <feFlood flood-opacity="0" result="BackgroundImageFix" />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset />
              <feGaussianBlur stdDeviation="7.01059" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0"
              />
              <feBlend
                mode="normal"
                in2="BackgroundImageFix"
                result="effect1_dropShadow_3399_6834"
              />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="effect1_dropShadow_3399_6834"
                result="shape"
              />
            </filter>
          </defs>
        </svg>
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

  function handleCloseInsight() {
    setShowInsightPopup(false);
  }

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
        trendPercent: 17,
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
        <HStack
          className="header-filters"
          justify="space-between"
          style={{ marginLeft: "-11px" }}
        >
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
          <button className="btn" type="button" onClick={() => window.location.reload()}>Refresh</button>
            <Link className="btn" to="/calendar">Calendar</Link>
        </div>
      </section>

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
      {showInsightPopup ? (
        <InsightPopup onClose={handleCloseInsight} />
      ) : (
        <InsightCornerIcon onOpen={() => setShowInsightPopup(true)} />
      )}
    </Box>
  );
}
