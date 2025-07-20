import React from 'react';
import { Box } from '@mui/material';
import { 
  AttachMoney as AttachMoneyIcon,
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  Reply as ReplyIcon,
  Summarize as SummarizeIcon
} from '@mui/icons-material';
import type { DashboardPayload } from '../../types/dashboard';
import MetricCard from './MetricCard';
import RequestsChartCard from './cards/RequestsChartCard';
import ErrorsDonutCard from './cards/ErrorsDonutCard';
import TopModelsCard from './cards/TopModelsCard';
import CostsBarCard from './cards/CostsBarCard';
import TopCountriesCard from './cards/TopCountriesCard';
import LatencyChartCard from './cards/LatencyChartCard';
import UsersCard from './cards/UsersCard';
import TokensMinuteCard from './cards/TokensMinuteCard';
import QuantilesCard from './cards/QuantilesCard';
import ScoresCard from './cards/ScoresCard';
import FeedbackCard from './cards/FeedbackCard';
import TimeToFirstTokenCard from './cards/TimeToFirstTokenCard';
import ThreatsCard from './cards/ThreatsCard';
import RequestNewGraphCard from './cards/RequestNewGraphCard';

interface Props {
  data: DashboardPayload;
}

const DashboardGrid: React.FC<Props> = ({ data }) => {
  return (
    <Box
      sx={{
        height: '100%', // Use full height of parent container
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gridTemplateRows: 'auto 1fr 1fr 1fr',
        gap: 3,
        gridTemplateAreas: `
          "metric1 metric1 metric1 metric2 metric2 metric2 metric3 metric3 metric3 metric4 metric4 metric4"
          "requests requests requests requests requests requests requests requests errors errors errors errors"
          "models models models models costs costs costs costs countries countries countries countries"
          "latency latency latency latency latency latency tokens-min tokens-min quantiles quantiles scores scores"
          "feedback feedback feedback feedback ttft ttft ttft ttft threats threats request-graph request-graph"
        `,
        '@media (max-width: 1200px)': {
          gridTemplateColumns: 'repeat(8, 1fr)',
          gridTemplateRows: 'auto repeat(8, 1fr)',
          gridTemplateAreas: `
            "metric1 metric1 metric2 metric2 metric3 metric3 metric4 metric4"
            "requests requests requests requests requests requests requests requests"
            "errors errors errors errors models models models models"
            "costs costs costs costs countries countries countries countries"
            "latency latency latency latency latency latency latency latency"
            "tokens-min tokens-min tokens-min quantiles quantiles quantiles scores scores"
            "feedback feedback feedback feedback ttft ttft ttft ttft"
            "threats threats threats threats request-graph request-graph request-graph request-graph"
          `,
        },
        '@media (max-width: 768px)': {
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridTemplateRows: 'auto repeat(12, 1fr)',
          gridTemplateAreas: `
            "metric1 metric1 metric2 metric2"
            "metric3 metric3 metric4 metric4"
            "requests requests requests requests"
            "requests requests requests requests"
            "errors errors errors errors"
            "models models models models"
            "costs costs costs costs"
            "countries countries countries countries"
            "latency latency latency latency"
            "tokens-min tokens-min quantiles quantiles"
            "scores scores feedback feedback"
            "ttft ttft ttft ttft"
            "threats threats request-graph request-graph"
          `,
        },
      }}
    >
      {/* Top Summary Metrics Row */}
      <Box sx={{ gridArea: 'metric1' }}>
        <MetricCard 
          title="Avg Cost / Req" 
          headline="$0.00026" 
          height="100%"
          icon={<AttachMoneyIcon />}
        >
          &nbsp;
        </MetricCard>
      </Box>
      <Box sx={{ gridArea: 'metric2' }}>
        <MetricCard 
          title="Avg Prompt Tokens / Req" 
          headline="112.56" 
          height="100%"
          icon={<ChatBubbleOutlineIcon />}
        >
          &nbsp;
        </MetricCard>
      </Box>
      <Box sx={{ gridArea: 'metric3' }}>
        <MetricCard 
          title="Avg Completion Tokens / Req" 
          headline="137.48" 
          height="100%"
          icon={<ReplyIcon />}
        >
          &nbsp;
        </MetricCard>
      </Box>
      <Box sx={{ gridArea: 'metric4' }}>
        <MetricCard 
          title="Avg Total Tokens / Req" 
          headline="250.04" 
          height="100%"
          icon={<SummarizeIcon />}
        >
          &nbsp;
        </MetricCard>
      </Box>

      {/* Main Dashboard Cards */}
      <Box sx={{ gridArea: 'requests' }}>
        <RequestsChartCard data={data.requests} />
      </Box>
      
      <Box sx={{ gridArea: 'errors' }}>
        <ErrorsDonutCard data={data.errorsBreakdown} />
      </Box>

      <Box sx={{ gridArea: 'models' }}>
        <TopModelsCard data={data.topModels} />
      </Box>
      
      <Box sx={{ gridArea: 'costs' }}>
        <CostsBarCard data={data.costs} />
      </Box>
      
      <Box sx={{ gridArea: 'countries' }}>
        <TopCountriesCard data={data.topCountries} />
      </Box>

      <Box sx={{ gridArea: 'latency' }}>
        <LatencyChartCard data={data.latency} />
      </Box>

      <Box sx={{ gridArea: 'tokens-min' }}>
        <TokensMinuteCard />
      </Box>
      
      <Box sx={{ gridArea: 'quantiles' }}>
        <QuantilesCard />
      </Box>

      <Box sx={{ gridArea: 'scores' }}>
        <ScoresCard />
      </Box>
      
      <Box sx={{ gridArea: 'feedback' }}>
        <FeedbackCard />
      </Box>
      
      <Box sx={{ gridArea: 'ttft' }}>
        <TimeToFirstTokenCard />
      </Box>

      <Box sx={{ gridArea: 'threats' }}>
        <ThreatsCard />
      </Box>
      
      <Box sx={{ gridArea: 'request-graph' }}>
        <RequestNewGraphCard />
      </Box>
    </Box>
  );
};

export default DashboardGrid; 