import axios, { AxiosRequestConfig } from 'axios';

type AliyunApiNode = {
  [key: string]: unknown;
  data?: AliyunApiNode;
  list?: AliyunApiNode[];
};

type AliyunApiResponse = {
  data: AliyunApiNode;
};

class AliyunApiService {
  private appKey: string;
  private appSecret: string;
  private endpoint: string;
  private appCode: string;

  constructor() {
    this.appKey = process.env.ALIYUN_API_APP_KEY || '';
    this.appSecret = process.env.ALIYUN_API_APP_SECRET || '';
    this.appCode = process.env.ALIYUN_API_APP_CODE || '';
    this.endpoint = process.env.ALIYUN_API_ENDPOINT || '';

    if (!this.appCode || !this.endpoint) {
      console.warn(
        'Missing ALIYUN_API_APP_CODE or ALIYUN_API_ENDPOINT; market endpoints will fall back to mock data.'
      );
    }
  }

  private async request(
    path: string,
    data: Record<string, string>,
    method: 'GET' | 'POST' = 'POST'
  ): Promise<AliyunApiResponse> {
    if (!this.appCode || !this.endpoint) {
      throw new Error(
        'Aliyun market API is not configured. Please set ALIYUN_API_APP_CODE and ALIYUN_API_ENDPOINT.'
      );
    }

    try {
      const formData = Object.entries(data)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');

      const config: AxiosRequestConfig<string> = {
        method,
        url: `${this.endpoint}${path}`,
        headers: {
          Authorization: `APPCODE ${this.appCode}`,
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
      };

      if (method === 'GET') {
        config.params = data;
      } else {
        config.data = formData;
      }

      const response = await axios.request<AliyunApiNode, { data: AliyunApiNode }, string>(
        config
      );
      return { data: response.data };
    } catch (error) {
      console.error('Aliyun API request failed:', error);
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const status = error.response.status;
          const responseData = error.response.data;
          const message =
            typeof responseData === 'object' &&
            responseData !== null &&
            'message' in responseData &&
            typeof responseData.message === 'string'
              ? responseData.message
              : error.response.statusText || 'Server returned an error';
          throw new Error(`API request failed (${status}): ${message}`);
        }

        if (error.request) {
          throw new Error('API request timed out or the network connection failed');
        }

        throw new Error(`Request configuration error: ${error.message}`);
      }

      throw new Error(
        `Failed to fetch market data: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getIndices(): Promise<AliyunApiResponse> {
    return this.request('/stock/a/rank', {
      market: 'hs_a',
      sort: 'changeRate',
      asc: '0',
      pageNo: '1',
      pageSize: '10',
    });
  }

  async getStockQuote(code: string): Promise<AliyunApiResponse> {
    return this.request('/stock/a/price', {
      symbol: code,
    });
  }

  async getStocks(): Promise<AliyunApiResponse> {
    return this.request('/stock/a/rank', {
      market: 'hs_a',
      sort: 'changeRate',
      asc: '0',
      pageNo: '1',
      pageSize: '100',
    });
  }

  async getSectors(): Promise<AliyunApiResponse> {
    return this.request('/stock/a/rank', {
      market: 'hs_a',
      sort: 'changeRate',
      asc: '0',
      pageNo: '1',
      pageSize: '10',
    });
  }

  async getNews(_category?: string): Promise<AliyunApiResponse> {
    return this.request('/stock/a/rank', {
      market: 'hs_a',
      sort: 'changeRate',
      asc: '0',
      pageNo: '1',
      pageSize: '10',
    });
  }

  async getFundamentals(_code: string): Promise<AliyunApiResponse> {
    return this.request('/stock/a/rank', {
      market: 'hs_a',
      sort: 'changeRate',
      asc: '0',
      pageNo: '1',
      pageSize: '10',
    });
  }

  async getKline(
    code: string,
    period: string = '1d',
    limit: string = '60'
  ): Promise<AliyunApiResponse> {
    const typeMap: Record<string, string> = {
      '1d': '240',
      '5d': '240',
      '1m': '1',
      '5m': '5',
      '15m': '15',
      '30m': '30',
      '60m': '60',
    };

    return this.request('/stock/a/kline', {
      symbol: code,
      type: typeMap[period] || '240',
      pageSize: limit,
    });
  }

  async getStockRank(): Promise<AliyunApiResponse> {
    return this.request('/stock/a/rank', {
      sort: 'changeRate',
      market: 'hs_a',
      asc: '0',
      pageNo: '1',
      pageSize: '10',
    });
  }
}

export default new AliyunApiService();
