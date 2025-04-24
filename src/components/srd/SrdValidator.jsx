import {
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';

const SrdValidator = ({ issues = [] }) => {
    // Categorize issues by severity
    const errorIssues = issues.filter(issue => issue.severity === 'error');
    const warningIssues = issues.filter(issue => issue.severity === 'warning');
    const infoIssues = issues.filter(issue => issue.severity === 'info');

    // Determine overall status
    let status = 'compliant';
    if (errorIssues.length > 0) {
        status = 'non-compliant';
    } else if (warningIssues.length > 0) {
        status = 'warning';
    }

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-xl font-medium mb-2">SRD Compliance Status</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                    The SRD (Systems Reference Document) contains guidelines for publishing D&D content.
                    Ensuring your homebrew is SRD-compliant allows you to share it publicly.
                </p>

                <div className={`p-4 rounded-lg border ${status === 'compliant'
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : status === 'warning'
                            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    }`}>
                    <div className="flex items-center">
                        {status === 'compliant' && (
                            <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3" />
                        )}
                        {status === 'warning' && (
                            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500 mr-3" />
                        )}
                        {status === 'non-compliant' && (
                            <XCircleIcon className="h-6 w-6 text-red-500 mr-3" />
                        )}

                        <div>
                            <h3 className={`font-medium ${status === 'compliant'
                                    ? 'text-green-800 dark:text-green-300'
                                    : status === 'warning'
                                        ? 'text-yellow-800 dark:text-yellow-300'
                                        : 'text-red-800 dark:text-red-300'
                                }`}>
                                {status === 'compliant'
                                    ? 'SRD Compliant'
                                    : status === 'warning'
                                        ? 'Potential SRD Issues'
                                        : 'Not SRD Compliant'}
                            </h3>
                            <p className={`text-sm ${status === 'compliant'
                                    ? 'text-green-700 dark:text-green-400'
                                    : status === 'warning'
                                        ? 'text-yellow-700 dark:text-yellow-400'
                                        : 'text-red-700 dark:text-red-400'
                                }`}>
                                {status === 'compliant'
                                    ? 'This content appears to be compliant with SRD guidelines.'
                                    : status === 'warning'
                                        ? 'This content may have SRD compliance issues.'
                                        : 'This content contains elements not compliant with SRD guidelines.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {issues.length > 0 ? (
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Issues Found</h3>

                    {errorIssues.length > 0 && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                            <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">
                                Critical Issues ({errorIssues.length})
                            </h4>
                            <ul className="space-y-2">
                                {errorIssues.map((issue, index) => (
                                    <li key={index} className="flex items-start">
                                        <XCircleIcon className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                                        <span className="text-red-700 dark:text-red-400">{issue.message}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {warningIssues.length > 0 && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                            <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">
                                Warnings ({warningIssues.length})
                            </h4>
                            <ul className="space-y-2">
                                {warningIssues.map((issue, index) => (
                                    <li key={index} className="flex items-start">
                                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                                        <span className="text-yellow-700 dark:text-yellow-400">{issue.message}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {infoIssues.length > 0 && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                                Information ({infoIssues.length})
                            </h4>
                            <ul className="space-y-2">
                                {infoIssues.map((issue, index) => (
                                    <li key={index} className="flex items-start">
                                        <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                                        <span className="text-blue-700 dark:text-blue-400">{issue.message}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6 text-center">
                    <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No Issues Detected</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                        Your content appears to be compliant with SRD guidelines.
                    </p>
                </div>
            )}

            <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <InformationCircleIcon className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">What is SRD Compliance?</h3>
                        <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                            <p>The Systems Reference Document (SRD) contains guidelines for publishing content under the Open Gaming License (OGL) or Creative Commons.</p>
                            <p className="mt-2">Content that is SRD-compliant can be freely shared and published, while non-SRD content (such as specific elements from published books beyond the SRD) cannot be shared publicly.</p>
                            <a
                                href="https://www.dndbeyond.com/srd"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-block text-blue-600 dark:text-blue-300 hover:underline"
                            >
                                View SRD Reference →
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SrdValidator;