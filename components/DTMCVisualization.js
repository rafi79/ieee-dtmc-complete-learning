'use client'

import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Info, BookOpen, Calculator, Brain, Target } from 'lucide-react';

const DTMCVisualization = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentState, setCurrentState] = useState(0);
  const [stepCount, setStepCount] = useState(0);
  const [selectedClass, setSelectedClass] = useState('UP0');
  const [showTransitions, setShowTransitions] = useState(true);
  const [transitionHistory, setTransitionHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('simulation');

  // System parameters from our calculation
  const systems = {
    UP0: {
      name: 'UP0 (Low Priority)',
      CPmax: 0.125,
      CPmin: 0.0625,
      states: [
        { id: 0, CP: 0.125, success: 0.071486, collision: 0.053514, idle: 0.875 },
        { id: 1, CP: 0.125, success: 0.071486, collision: 0.053514, idle: 0.875 },
        { id: 2, CP: 0.0625, success: 0.035743, collision: 0.026757, idle: 0.9375 }
      ],
      steadyState: [0.869814, 0.093019, 0.037167],
      color: '#ef4444',
      emoji: '👶'
    },
    UP5: {
      name: 'UP5 (High Priority)',
      CPmax: 0.375,
      CPmin: 0.1875,
      states: [
        { id: 0, CP: 0.375, success: 0.299956, collision: 0.075044, idle: 0.625 },
        { id: 1, CP: 0.375, success: 0.299956, collision: 0.075044, idle: 0.625 },
        { id: 2, CP: 0.1875, success: 0.149978, collision: 0.037522, idle: 0.8125 }
      ],
      steadyState: [0.852357, 0.127947, 0.019696],
      color: '#3b82f6',
      emoji: '🦸'
    }
  };

  const currentSystem = systems[selectedClass];

  // Tutorial content sections
  const tutorialSections = [
    {
      id: 'basics',
      title: '🎯 The Big Question',
      icon: <Target className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-lg font-semibold text-blue-800">
            Imagine smart watches (heart monitors) trying to talk to a doctor's computer...
          </p>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-bold text-yellow-800 mb-2">The Challenge:</h4>
            <ul className="space-y-2 text-sm">
              <li>🚨 Emergency devices (heart monitors) need priority</li>
              <li>📱 Regular devices (step counters) need fair chances</li>
              <li>💥 Prevent everyone talking at once (collisions!)</li>
              <li>📊 Predict how well the system works</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'cp',
      title: '🎲 Contention Probability (CP)',
      icon: <Calculator className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <p>Think of CP like <strong>"courage level"</strong> - how brave a device is to try talking!</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl mb-2">👶</div>
              <div className="font-bold text-red-600">UP0 (Baby Device)</div>
              <div>CP = 1/8 = 0.125</div>
              <div className="text-sm text-red-500">Shy, not very brave</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl mb-2">🦸</div>
              <div className="font-bold text-blue-600">UP5 (Hero Device)</div>
              <div>CP = 3/8 = 0.375</div>
              <div className="text-sm text-blue-500">Brave, confident!</div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-bold text-green-800 mb-2">Simple Rule:</h4>
            <p className="text-green-700">Higher CP = More likely to try talking = Higher priority!</p>
          </div>
        </div>
      )
    },
    {
      id: 'decision',
      title: '🎮 How Devices Decide to Talk',
      icon: <Brain className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <p>Every time slot, each device follows these steps:</p>
          <div className="space-y-3">
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="font-bold text-purple-800">1. 🎲 Roll the Dice</div>
              <div className="text-sm">Pick random number between 0 and 1</div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="font-bold text-orange-800">2. 🤔 Compare with CP</div>
              <div className="text-sm">"Am I brave enough?"</div>
              <div className="text-xs mt-1">
                • If dice ≤ CP → "Yes! I'll try to talk!"<br/>
                • If dice > CP → "No, I'll stay quiet"
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-bold mb-2">Example:</h4>
            <div className="text-sm space-y-1">
              <div>UP0: dice = 0.1, CP = 0.125 → 0.1 ≤ 0.125 → "I'll talk!" ✅</div>
              <div>UP0: dice = 0.5, CP = 0.125 → 0.5 > 0.125 → "Stay quiet" ❌</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'outcomes',
      title: '🔄 What Happens After Talking',
      icon: <Info className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <p>Three possible outcomes when a device tries to talk:</p>
          <div className="space-y-3">
            <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-500">
              <div className="font-bold text-green-800">✅ SUCCESS</div>
              <div className="text-sm">I talked and nobody else did → "Yay! Message sent!"</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg border-l-4 border-red-500">
              <div className="font-bold text-red-800">💥 COLLISION</div>
              <div className="text-sm">I talked but someone else talked too → "Oops! Try again later"</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-gray-500">
              <div className="font-bold text-gray-800">😴 IDLE</div>
              <div className="text-sm">I decided not to talk → "Maybe next time"</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'states',
      title: '🏠 Understanding States',
      icon: <BookOpen className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <p>Think of states like <strong>mood levels</strong> after failing:</p>
          <div className="space-y-3">
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-xl">😄 <strong>State 0</strong></div>
              <div>"I'm fresh and confident!" (highest CP)</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="text-xl">😐 <strong>State 1</strong></div>
              <div>"I failed once, a bit less confident" (same CP for odd failures)</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="text-xl">😟 <strong>State 2</strong></div>
              <div>"I failed twice, much less confident" (lower CP for even failures)</div>
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-bold text-blue-800 mb-2">The Backoff Rule:</h4>
            <p className="text-blue-700">Every 2nd failure makes you less brave (CP gets smaller)!</p>
          </div>
        </div>
      )
    },
    {
      id: 'calculations',
      title: '🧮 Basic Math Calculations',
      icon: <Calculator className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-bold text-purple-800 mb-2">🎯 Transmission Probability:</h4>
            <div className="font-mono text-sm">
              P(I try to talk) = CP<br/>
              P(I stay quiet) = 1 - CP
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-bold text-green-800 mb-2">✅ Success Probability:</h4>
            <div className="font-mono text-sm">
              P(Success) = CP × P(Nobody else talks)
            </div>
            <div className="text-xs mt-2 text-green-600">
              Success = I talk AND everyone else stays quiet
            </div>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-bold text-red-800 mb-2">💥 Collision Probability:</h4>
            <div className="font-mono text-sm">
              P(Collision) = CP × P(At least one other talks)
            </div>
            <div className="text-xs mt-2 text-red-600">
              Collision = I talk AND someone else talks too
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-bold text-yellow-800 mb-2">📊 Real Example (UP0):</h4>
            <div className="text-sm space-y-1">
              <div>CP = 1/8 = 0.125</div>
              <div>P(Try to talk) = 0.125</div>
              <div>P(Stay quiet) = 0.875</div>
              <div>P(Success) = 0.125 × 0.875 = 0.109</div>
              <div>P(Collision) = 0.125 × 0.125 = 0.016</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'balance',
      title: '⚖️ Balance Equations Magic',
      icon: <Brain className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <p>Imagine water flowing between buckets (states)...</p>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-bold text-blue-800 mb-2">What is "Balance"?</h4>
            <ul className="text-sm space-y-1">
              <li>• Water flowing IN = Water flowing OUT</li>
              <li>• Each bucket's water level stays constant</li>
              <li>• This is called "steady-state"</li>
            </ul>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-bold text-green-800 mb-2">For State 0 (Fresh & Happy):</h4>
            <div className="font-mono text-xs bg-white p-2 rounded">
              π₀ = π₀ × P(stay) + π₁ × P(return) + π₂ × P(return)
            </div>
            <div className="text-xs mt-2">Devices stay fresh OR return from failed states</div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-bold text-yellow-800 mb-2">Final Results (UP0 Example):</h4>
            <div className="text-sm space-y-1">
              <div>π₀ = 0.8 (80% time fresh and happy! 😄)</div>
              <div>π₁ = 0.1 (10% time after 1 failure 😐)</div>
              <div>π₂ = 0.1 (10% time after 2+ failures 😟)</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'performance',
      title: '🎯 Final Performance Metrics',
      icon: <Target className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-bold text-purple-800 mb-2">📊 Average Transmission Rate:</h4>
            <div className="font-mono text-sm">
              τ = π₀×CP₀ + π₁×CP₁ + π₂×CP₂
            </div>
            <div className="text-xs mt-2">How often device tries to talk on average</div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-bold text-red-800 mb-2">⚔️ Collision Rate:</h4>
            <div className="font-mono text-sm">
              γ = 1 - (1-τ)^(n-1)
            </div>
            <div className="text-xs mt-2">Chance of collision when talking</div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-bold text-green-800 mb-2">🏆 Throughput (The Goal!):</h4>
            <div className="font-mono text-sm">
              η = n × τ × (1-γ)
            </div>
            <div className="text-xs mt-2">Useful communication rate</div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-bold text-blue-800 mb-2">🏁 Why Higher Priority Wins:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="font-semibold">UP0: τ ≈ 0.12</div>
                <div>More backed-off states</div>
              </div>
              <div>
                <div className="font-semibold">UP5: τ ≈ 0.36</div>
                <div>More aggressive!</div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  // Simulation logic (same as before)
  const simulateTransition = () => {
    const state = currentSystem.states[currentState];
    const rand = Math.random();
    
    let nextState = currentState;
    let event = '';

    if (currentState === 0) {
      if (rand < state.success) {
        nextState = 0;
        event = 'success';
      } else if (rand < state.success + state.collision) {
        nextState = 1;
        event = 'collision';
      } else {
        nextState = 0;
        event = 'idle';
      }
    } else if (currentState === 1) {
      if (rand < state.success) {
        nextState = 0;
        event = 'success';
      } else if (rand < state.success + state.collision) {
        nextState = 2;
        event = 'collision';
      } else {
        nextState = 1;
        event = 'idle';
      }
    } else {
      if (rand < state.success) {
        nextState = 0;
        event = 'success';
      } else if (rand < state.success + state.collision) {
        nextState = 2;
        event = 'collision';
      } else {
        nextState = 2;
        event = 'idle';
      }
    }

    setCurrentState(nextState);
    setStepCount(prev => prev + 1);
    setTransitionHistory(prev => [
      ...prev.slice(-9),
      { from: currentState, to: nextState, event, step: stepCount + 1 }
    ]);
  };

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(simulateTransition, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, currentState, stepCount]);

  const reset = () => {
    setIsPlaying(false);
    setCurrentState(0);
    setStepCount(0);
    setTransitionHistory([]);
  };

  const getStateColor = (stateId) => {
    if (stateId === currentState) {
      return currentSystem.color;
    }
    return '#e5e7eb';
  };

  const getTransitionOpacity = (from, to) => {
    if (!showTransitions) return 0;
    
    const state = currentSystem.states[from];
    let prob = 0;
    
    if (from === 0 && to === 0) prob = state.success + state.idle;
    else if (from === 0 && to === 1) prob = state.collision;
    else if (from === 1 && to === 0) prob = state.success;
    else if (from === 1 && to === 1) prob = state.idle;
    else if (from === 1 && to === 2) prob = state.collision;
    else if (from === 2 && to === 0) prob = state.success;
    else if (from === 2 && to === 2) prob = state.collision + state.idle;
    
    return prob * 0.8;
  };

  const TabButton = ({ id, label, icon, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        isActive 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-white">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          🧮 IEEE 802.15.6 DTMC: Complete Learning Experience
        </h1>
        <p className="text-gray-600 text-lg">
          Learn the math, see the simulation, understand the magic! ✨
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <TabButton
          id="tutorial"
          label="📚 Math Tutorial"
          icon={<BookOpen className="w-5 h-5" />}
          isActive={activeTab === 'tutorial'}
          onClick={setActiveTab}
        />
        <TabButton
          id="simulation"
          label="🎮 Interactive Simulation"
          icon={<Play className="w-5 h-5" />}
          isActive={activeTab === 'simulation'}
          onClick={setActiveTab}
        />
        <TabButton
          id="equations"
          label="🧮 Step-by-Step Math"
          icon={<Calculator className="w-5 h-5" />}
          isActive={activeTab === 'equations'}
          onClick={setActiveTab}
        />
      </div>

      {/* Tutorial Tab */}
      {activeTab === 'tutorial' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border-l-4 border-blue-500">
            <h2 className="text-2xl font-bold text-blue-800 mb-3">
              🎯 DTMC Mathematics - Explained Like You're 5!
            </h2>
            <p className="text-blue-700">
              Follow these steps to understand how smart devices share wireless channels fairly!
            </p>
          </div>

          <div className="grid gap-6">
            {tutorialSections.map((section, index) => (
              <div key={section.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    {section.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Step {index + 1}: {section.title}
                  </h3>
                </div>
                {section.content}
              </div>
            ))}
          </div>

          <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
            <h3 className="text-xl font-bold text-green-800 mb-3">🎓 Congratulations!</h3>
            <p className="text-green-700 mb-3">
              You now understand the mathematics behind IEEE 802.15.6 DTMC! 
            </p>
            <p className="text-green-600">
              Ready to see it in action? Click the "🎮 Interactive Simulation" tab!
            </p>
          </div>
        </div>
      )}

      {/* Simulation Tab */}
      {activeTab === 'simulation' && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg flex-wrap">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                isPlaying 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            
            <button
              onClick={reset}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium"
            >
              <RotateCcw size={20} />
              Reset
            </button>

            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                reset();
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg font-medium"
            >
              <option value="UP0">👶 UP0 (Low Priority)</option>
              <option value="UP5">🦸 UP5 (High Priority)</option>
            </select>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showTransitions}
                onChange={(e) => setShowTransitions(e.target.checked)}
                className="rounded"
              />
              <span className="font-medium">Show Transition Probabilities</span>
            </label>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* DTMC Diagram */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">
                {currentSystem.emoji} {currentSystem.name} - State Diagram
              </h2>
              
              <svg viewBox="0 0 500 350" className="w-full h-80 border rounded bg-white">
                {/* Transition arrows */}
                {showTransitions && (
                  <g stroke="#6b7280" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)">
                    {/* Self loops */}
                    <path
                      d="M 100 80 Q 100 40 140 80"
                      opacity={getTransitionOpacity(0, 0)}
                      strokeWidth="3"
                    />
                    <path
                      d="M 250 80 Q 250 40 290 80"
                      opacity={getTransitionOpacity(1, 1)}
                      strokeWidth="3"
                    />
                    <path
                      d="M 400 80 Q 400 40 440 80"
                      opacity={getTransitionOpacity(2, 2)}
                      strokeWidth="3"
                    />
                    
                    {/* Forward transitions */}
                    <path
                      d="M 140 100 Q 200 120 210 100"
                      opacity={getTransitionOpacity(0, 1)}
                      strokeWidth="3"
                    />
                    <path
                      d="M 290 100 Q 350 120 360 100"
                      opacity={getTransitionOpacity(1, 2)}
                      strokeWidth="3"
                    />
                    
                    {/* Return to state 0 */}
                    <path
                      d="M 210 140 Q 150 180 100 140"
                      opacity={getTransitionOpacity(1, 0)}
                      strokeWidth="3"
                    />
                    <path
                      d="M 360 140 Q 250 200 100 140"
                      opacity={getTransitionOpacity(2, 0)}
                      strokeWidth="3"
                    />
                  </g>
                )}

                {/* Arrow marker */}
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                          refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
                  </marker>
                </defs>

                {/* States */}
                {[0, 1, 2].map((stateId) => (
                  <g key={stateId}>
                    <circle
                      cx={100 + stateId * 150}
                      cy={100}
                      r="40"
                      fill={getStateColor(stateId)}
                      stroke="#374151"
                      strokeWidth="3"
                      className="transition-all duration-500"
                    />
                    <text
                      x={100 + stateId * 150}
                      y={90}
                      textAnchor="middle"
                      className="text-lg font-bold fill-white"
                    >
                      {['😄', '😐', '😟'][stateId]}
                    </text>
                    <text
                      x={100 + stateId * 150}
                      y={110}
                      textAnchor="middle"
                      className="text-lg font-bold fill-white"
                    >
                      {stateId}
                    </text>
                    
                    {/* State info */}
                    <text
                      x={100 + stateId * 150}
                      y={160}
                      textAnchor="middle"
                      className="text-sm font-medium fill-gray-700"
                    >
                      CP = {currentSystem.states[stateId].CP.toFixed(3)}
                    </text>
                    <text
                      x={100 + stateId * 150}
                      y={180}
                      textAnchor="middle"
                      className="text-xs fill-gray-600"
                    >
                      π = {currentSystem.steadyState[stateId].toFixed(3)}
                    </text>
                  </g>
                ))}

                {/* Current state indicator */}
                <circle
                  cx={100 + currentState * 150}
                  cy={100}
                  r="50"
                  fill="none"
                  stroke={currentSystem.color}
                  strokeWidth="4"
                  strokeDasharray="8,4"
                  className="animate-pulse"
                />

                {/* Legend */}
                <text x={20} y={280} className="text-sm font-bold fill-gray-700">
                  Current State: {currentState} {['😄', '😐', '😟'][currentState]}
                </text>
                <text x={20} y={300} className="text-sm fill-gray-600">
                  Step: {stepCount}
                </text>
                <text x={20} y={320} className="text-sm fill-gray-600">
                  CP = Contention Probability
                </text>
              </svg>
            </div>

            {/* Information Panels */}
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-blue-800 mb-2 flex items-center gap-2">
                  <Info size={20} />
                  Current State: {['Fresh & Happy', 'Failed Once', 'Failed Twice+'][currentState]}
                </h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Mood:</strong> {['😄 Confident!', '😐 A bit worried', '😟 Very careful'][currentState]}</div>
                  <div><strong>Courage (CP):</strong> {currentSystem.states[currentState].CP.toFixed(3)}</div>
                  <div><strong>Success Chance:</strong> {(currentSystem.states[currentState].success * 100).toFixed(1)}%</div>
                  <div><strong>Collision Chance:</strong> {(currentSystem.states[currentState].collision * 100).toFixed(1)}%</div>
                  <div><strong>Stay Quiet Chance:</strong> {(currentSystem.states[currentState].idle * 100).toFixed(1)}%</div>
                  <div><strong>Time Spent Here:</strong> {(currentSystem.steadyState[currentState] * 100).toFixed(1)}%</div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-green-800 mb-2">📈 Recent Transitions</h3>
                <div className="space-y-1 text-sm">
                  {transitionHistory.slice(-5).map((transition, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span>Step {transition.step}:</span>
                      <span className="font-mono bg-white px-2 py-1 rounded">
                        {transition.from} → {transition.to} ({transition.event})
                      </span>
                      <span>
                        {transition.event === 'success' ? '✅' : 
                         transition.event === 'collision' ? '💥' : '😴'}
                      </span>
                    </div>
                  ))}
                  {transitionHistory.length === 0 && (
                    <div className="text-gray-500 italic">Press Play to start simulation</div>
                  )}
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-yellow-800 mb-2">🏁 Priority Comparison</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-red-100 p-3 rounded">
                    <div className="font-bold text-red-600">👶 UP0 (Shy Baby)</div>
                    <div>CPmax: 0.125</div>
                    <div>Tries talking: 12.5%</div>
                    <div>Fresh time: 87.0%</div>
                  </div>
                  <div className="bg-blue-100 p-3 rounded">
                    <div className="font-bold text-blue-600">🦸 UP5 (Brave Hero)</div>
                    <div>CPmax: 0.375</div>
                    <div>Tries talking: 37.5%</div>
                    <div>Fresh time: 85.2%</div>
                  </div>
                </div>
                <div className="mt-2 text-center text-xs text-yellow-700">
                  Hero is 3x more likely to talk! 🦸 > 👶
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Equations Tab */}
      {activeTab === 'equations' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border-l-4 border-purple-500">
            <h2 className="text-2xl font-bold text-purple-800 mb-3">
              🧮 Step-by-Step Mathematical Solution
            </h2>
            <p className="text-purple-700">
              Follow along with the complete numerical example for UP0!
            </p>
          </div>

          {/* Step by step mathematical solution */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">📝 Given Information</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>System Parameters:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>User Priority: UP0 (Low Priority)</li>
                      <li>Number of devices: n₀ = 2</li>
                      <li>Maximum states: m = 2</li>
                      <li>States: {0, 1, 2}</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Probability Values:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>CPmax = 1/8 = 0.125</li>
                      <li>CPmin = 1/16 = 0.0625</li>
                      <li>States 0,1: CP = 0.125</li>
                      <li>State 2: CP = 0.0625</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">🔢 Step 1: Calculate Event Probabilities</h3>
              
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-bold text-green-800 mb-2">For State 0 (CP = 0.125):</h4>
                  <div className="font-mono text-sm space-y-1">
                    <div>P(Transmission) = CP = 0.125</div>
                    <div>P(Idle) = 1 - CP = 1 - 0.125 = 0.875</div>
                    <div>P(Other quiet) = 1 - 0.125 = 0.875</div>
                    <div className="border-t pt-2 mt-2">
                      <div>P(Success) = 0.125 × 0.875 = 0.109375</div>
                      <div>P(Collision) = 0.125 × 0.125 = 0.015625</div>
                    </div>
                  </div>
                  <div className="text-xs text-green-600 mt-2">
                    Check: 0.109375 + 0.015625 + 0.875 = 1.0 ✅
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-bold text-yellow-800 mb-2">For State 1 (CP = 0.125):</h4>
                  <div className="font-mono text-sm">
                    Same as State 0 (odd failure rule - no CP change)
                  </div>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-bold text-red-800 mb-2">For State 2 (CP = 0.0625):</h4>
                  <div className="font-mono text-sm space-y-1">
                    <div>P(Success) = 0.0625 × 0.9375 = 0.058594</div>
                    <div>P(Collision) = 0.0625 × 0.0625 = 0.003906</div>
                    <div>P(Idle) = 0.9375</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">⚖️ Step 2: Write Balance Equations</h3>
              
              <div className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-bold text-purple-800 mb-2">Equation System:</h4>
                  <div className="font-mono text-sm space-y-2">
                    <div>π₀ = π₀(0.984375) + π₁(0.109375) + π₂(0.058594)</div>
                    <div>π₁ = π₀(0.015625) + π₁(0.875)</div>
                    <div>π₂ = π₁(0.015625) + π₂(0.941406)</div>
                    <div>π₀ + π₁ + π₂ = 1</div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-bold text-blue-800 mb-2">Solving Step by Step:</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <strong>From Equation 2:</strong>
                      <div className="font-mono ml-4">
                        π₁(1 - 0.875) = π₀(0.015625)<br/>
                        π₁ = π₀ × 0.125
                      </div>
                    </div>
                    <div>
                      <strong>From Equation 3:</strong>
                      <div className="font-mono ml-4">
                        π₂(1 - 0.941406) = π₁(0.015625)<br/>
                        π₂ = π₁ × 0.266667 ≈ π₀ × 0.0333
                      </div>
                    </div>
                    <div>
                      <strong>From Normalization:</strong>
                      <div className="font-mono ml-4">
                        π₀(1 + 0.125 + 0.0333) = 1<br/>
                        π₀ = 1/1.1583 ≈ 0.863
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">🎯 Step 3: Final Results</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-bold text-green-800 mb-2">📊 Steady-State Probabilities:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>π₀ (Fresh):</span>
                      <span className="font-mono">0.863 (86.3%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>π₁ (1 failure):</span>
                      <span className="font-mono">0.108 (10.8%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>π₂ (2+ failures):</span>
                      <span className="font-mono">0.029 (2.9%)</span>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-bold text-orange-800 mb-2">🚀 Performance Metrics:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>τ (Trans. Rate):</span>
                      <span className="font-mono">0.123 (12.3%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>γ (Collision Rate):</span>
                      <span className="font-mono">0.119 (11.9%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>η (Throughput):</span>
                      <span className="font-mono">0.217 (21.7%)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-bold text-yellow-800 mb-2">🧠 What This Means:</h4>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>Device spends 86.3% of time fresh and confident</li>
                  <li>Tries to transmit 12.3% of all time slots</li>
                  <li>When competing with one other UP0 device</li>
                  <li>Achieves 21.7% of theoretical maximum throughput</li>
                  <li>The DTMC model perfectly predicts this behavior!</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
        <h3 className="text-lg font-bold text-gray-800 mb-2">🎓 Learning Complete!</h3>
        <p className="text-gray-700 mb-3">
          You've mastered the IEEE 802.15.6 DTMC mathematics! You can now:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <ul className="space-y-1 list-disc list-inside">
            <li>Understand how wireless priority systems work</li>
            <li>Calculate steady-state probabilities</li>
            <li>Predict network performance mathematically</li>
          </ul>
          <ul className="space-y-1 list-disc list-inside">
            <li>Design fair but prioritized communication systems</li>
            <li>Apply DTMC modeling to real-world problems</li>
            <li>Ensure critical devices get network priority</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DTMCVisualization;
