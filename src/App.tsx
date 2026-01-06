import React, { useState, useMemo } from 'react';
import { GitCompare, ArrowRight, Plus, Minus, RotateCcw } from 'lucide-react';

interface ComparisonResult {
  type: 'added' | 'removed' | 'moved' | 'unchanged';
  content: string;
  originalIndex?: number;
  newIndex?: number;
}

function App() {
  const [leftList, setLeftList] = useState('');
  const [rightList, setRightList] = useState('');

  const comparisonResults = useMemo(() => {
    if (!leftList.trim() && !rightList.trim()) return [];

    const leftLines = leftList.split('\n').filter(line => line.trim() !== '');
    const rightLines = rightList.split('\n').filter(line => line.trim() !== '');

    const results: ComparisonResult[] = [];
    const processedRight = new Set<number>();

    // Process left list
    leftLines.forEach((line, leftIndex) => {
      const rightIndex = rightLines.indexOf(line);
      
      if (rightIndex === -1) {
        // Item removed
        results.push({
          type: 'removed',
          content: line,
          originalIndex: leftIndex
        });
      } else if (rightIndex === leftIndex) {
        // Item unchanged
        results.push({
          type: 'unchanged',
          content: line,
          originalIndex: leftIndex,
          newIndex: rightIndex
        });
        processedRight.add(rightIndex);
      } else {
        // Item moved
        results.push({
          type: 'moved',
          content: line,
          originalIndex: leftIndex,
          newIndex: rightIndex
        });
        processedRight.add(rightIndex);
      }
    });

    // Process right list for additions
    rightLines.forEach((line, rightIndex) => {
      if (!processedRight.has(rightIndex)) {
        results.push({
          type: 'added',
          content: line,
          newIndex: rightIndex
        });
      }
    });

    return results.sort((a, b) => {
      const aIndex = a.originalIndex ?? a.newIndex ?? 0;
      const bIndex = b.originalIndex ?? b.newIndex ?? 0;
      return aIndex - bIndex;
    });
  }, [leftList, rightList]);

  const stats = useMemo(() => {
    const added = comparisonResults.filter(r => r.type === 'added').length;
    const removed = comparisonResults.filter(r => r.type === 'removed').length;
    const moved = comparisonResults.filter(r => r.type === 'moved').length;
    const unchanged = comparisonResults.filter(r => r.type === 'unchanged').length;
    
    return { added, removed, moved, unchanged, total: added + removed + moved };
  }, [comparisonResults]);

  const clearAll = () => {
    setLeftList('');
    setRightList('');
  };

  const loadExample = () => {
    setLeftList('Apple\nBanana\nCherry\nDate\nEldberry\nFig\nGrape');
    setRightList('Apple\nCherry\nBanana\nDate\nHoneydew\nFig\nKiwi');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
              <GitCompare className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">List Comparator</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Compare two lists line by line to identify differences and repositioned entries
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={loadExample}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Load Example
          </button>
          <button
            onClick={clearAll}
            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Clear All
          </button>
        </div>

        {/* Input Areas */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-gray-800">Original List</h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                Left
              </span>
            </div>
            <textarea
              value={leftList}
              onChange={(e) => setLeftList(e.target.value)}
              placeholder="Enter your original list here...&#10;One entry per line"
              className="w-full h-64 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-mono text-sm transition-all duration-200 shadow-sm hover:shadow-md"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-gray-800">Modified List</h2>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Right
              </span>
            </div>
            <textarea
              value={rightList}
              onChange={(e) => setRightList(e.target.value)}
              placeholder="Enter your modified list here...&#10;One entry per line"
              className="w-full h-64 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-mono text-sm transition-all duration-200 shadow-sm hover:shadow-md"
            />
          </div>
        </div>

        {/* Statistics */}
        {(leftList.trim() || rightList.trim()) && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Comparison Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="text-2xl font-bold text-red-600">{stats.removed}</div>
                <div className="text-sm text-red-700 font-medium">Removed</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">{stats.added}</div>
                <div className="text-sm text-green-700 font-medium">Added</div>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="text-2xl font-bold text-amber-600">{stats.moved}</div>
                <div className="text-sm text-amber-700 font-medium">Moved</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{stats.unchanged}</div>
                <div className="text-sm text-blue-700 font-medium">Unchanged</div>
              </div>
            </div>
            
            {stats.total > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-center text-gray-700">
                  <span className="font-semibold">{stats.total}</span> total changes detected
                  {stats.moved > 0 && (
                    <span className="text-amber-600 ml-2">
                      ({stats.moved} items repositioned)
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {comparisonResults.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Detailed Comparison</h3>
              <p className="text-sm text-gray-600 mt-1">Line-by-line analysis of changes</p>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {comparisonResults.map((result, index) => (
                <div
                  key={index}
                  className={`px-6 py-3 border-b border-gray-100 transition-colors duration-200 hover:bg-gray-50 ${
                    result.type === 'removed' ? 'bg-red-50 border-l-4 border-l-red-400' :
                    result.type === 'added' ? 'bg-green-50 border-l-4 border-l-green-400' :
                    result.type === 'moved' ? 'bg-amber-50 border-l-4 border-l-amber-400' :
                    'bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        {result.type === 'removed' && (
                          <div className="flex items-center gap-1 text-red-600">
                            <Minus className="w-4 h-4" />
                            <span className="text-xs font-medium">REMOVED</span>
                          </div>
                        )}
                        {result.type === 'added' && (
                          <div className="flex items-center gap-1 text-green-600">
                            <Plus className="w-4 h-4" />
                            <span className="text-xs font-medium">ADDED</span>
                          </div>
                        )}
                        {result.type === 'moved' && (
                          <div className="flex items-center gap-1 text-amber-600">
                            <ArrowRight className="w-4 h-4" />
                            <span className="text-xs font-medium">MOVED</span>
                          </div>
                        )}
                        {result.type === 'unchanged' && (
                          <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <code className="text-sm font-mono text-gray-800 break-words">
                          {result.content}
                        </code>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                      {result.type === 'moved' && (
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-gray-100 rounded">
                            Line {(result.originalIndex ?? 0) + 1}
                          </span>
                          <ArrowRight className="w-3 h-3" />
                          <span className="px-2 py-1 bg-gray-100 rounded">
                            Line {(result.newIndex ?? 0) + 1}
                          </span>
                        </div>
                      )}
                      {result.type === 'removed' && result.originalIndex !== undefined && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded">
                          Line {result.originalIndex + 1}
                        </span>
                      )}
                      {result.type === 'added' && result.newIndex !== undefined && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                          Line {result.newIndex + 1}
                        </span>
                      )}
                      {result.type === 'unchanged' && result.originalIndex !== undefined && (
                        <span className="px-2 py-1 bg-gray-100 rounded">
                          Line {result.originalIndex + 1}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!leftList.trim() && !rightList.trim() && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <GitCompare className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Ready to Compare</h3>
            <p className="text-gray-500 mb-6">Enter your lists above to see the differences</p>
            <button
              onClick={loadExample}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Try with Example Data
            </button>
          </div>
        )}

        {/* Legend */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-red-400 rounded"></div>
              <span className="text-sm font-medium text-gray-700">Removed from original</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-green-400 rounded"></div>
              <span className="text-sm font-medium text-gray-700">Added to modified</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-amber-400 rounded"></div>
              <span className="text-sm font-medium text-gray-700">Repositioned</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              <span className="text-sm font-medium text-gray-700">Unchanged</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;