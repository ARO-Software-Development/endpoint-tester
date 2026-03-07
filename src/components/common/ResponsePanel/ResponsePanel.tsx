import './ResponsePanel.css';

interface RequestResponse {
  status: number;
  statusText: string;
  responseTime: number;
  data: any;
  isError: boolean;
  errorMessage?: string;
}

interface ResponsePanelProps {
  response: RequestResponse | null;
  isLoading: boolean;
  getStatusCategory: (status: number) => string;
}

export default function ResponsePanel({
  response,
  isLoading,
  getStatusCategory,
}: ResponsePanelProps) {
  return (
    <div className='response-panel'>
      {!response && !isLoading && (
        <div className='response-empty'>
          Send a request to see the response.
        </div>
      )}

      {isLoading && (
        <div className='response-empty'>Sending request...</div>
      )}

      {response && !isLoading && (
        <>
          <div className='response-meta'>
            <span className={`status-badge ${getStatusCategory(response.status)}`}>
              {response.status === 0 ? 'Network Error' : `${response.status} ${response.statusText}`}
            </span>
            <span className='response-time'>
              {response.responseTime}ms
            </span>
          </div>

          {response.isError ? (
            <div className='response-body'>
              <span className='response-error'>
                {response.errorMessage}
              </span>
            </div>
          ) : (
            <div className='response-body'>
              {typeof response.data === 'string'
                ? response.data
                : JSON.stringify(response.data, null, 2)
              }
            </div>
          )}
        </>
      )}
    </div>
  );
}
