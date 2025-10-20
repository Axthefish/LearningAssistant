'use client'

import { UniversalFrameworkOptimized } from '@/components/3d/UniversalFrameworkOptimized'
import { mapUniversalFrameworkTo3D } from '@/lib/3d-mapper'
import { parseUniversalFramework } from '@/lib/markdown-parser'

const sampleMarkdown = `# Universal Action System: The Connection Architect System

## Core Modules: The Pillars of Success

### Self-Alignment
*   **Core Idea**: This matters because your inner state of confidence and emotional intelligence is the foundation upon which every successful interaction is built.
*   **Cultivate an Abundance Mindset**: Focus on building a fulfilling life independent of your relationship status.
    *   **Example**: Actively invest in your hobbies, career, and friendships, so your happiness isn't dependent on any single romantic outcome.
*   **Develop Emotional Acuity**: Learn to accurately read your own emotions and the social cues of others.
    *   **Example**: After a social event, take two minutes to reflect: "What emotions did I feel? What cues did I pick up from others? What might have caused those feelings?"

### Initiation
*   **Core Idea**: This matters because a positive, authentic first impression is the only way to open the door for any future possibility.
*   **Master the Observational Opener**: Start conversations naturally by commenting on your shared environment.
    *   **Example**: At a coffee shop, instead of a generic "Hi," say to the woman in front of you, "That looks amazing, is that the new seasonal drink? I'm trying to decide."
*   **Lead to a Clear Next Step**: End the first interaction with a specific, low-pressure plan or request.
    *   **Example**: Instead of a vague "We should hang out sometime," say, "I really enjoyed this chat. I'm going to that new taco place on Thursday. If you're free, I'd love for you to join me. What's your number?"

### Connection
*   **Core Idea**: This matters because this is where genuine attraction, trust, and a real bond are forged through shared experiences and meaningful conversation.
*   **Design Engaging Dates**: Plan activities that create fun, shared experiences rather than formal interviews.
    *   **Example**: Instead of a formal dinner, suggest a visit to an art gallery followed by a walk, or a cooking class, allowing for natural conversation and shared experience.
*   **Practice Conversational Deepening**: Move beyond surface-level topics to understand her values, passions, and motivations.
    *   **Example**: If she mentions she loves to travel, ask "What is it about traveling that really excites you?" instead of just "Where have you been?"

### Transition
*   **Core Idea**: This matters because clearly and respectfully defining the relationship is the final step that turns a great connection into a committed partnership.
*   **Assess Mutual Investment**: Before initiating a conversation, look for consistent signs that you are both prioritizing the connection.
    *   **Example**: Notice if she is initiating texts and plans as often as you are, introducing you to her friends, and making time for you consistently.
*   **Initiate the "Define the Relationship" (DTR) Conversation**: Proactively and calmly create a space to discuss moving forward exclusively.
    *   **Example**: During a quiet, positive moment, say, "I've really loved getting to know you and I'm not interested in seeing anyone else. I'd love for us to be exclusive. How do you feel about that?"

## System Dynamics: How the Modules Work Together

### 📈 Synergy: Authentic Confidence
*   **Interaction**: \`Self-Alignment\` + \`Initiation\`
*   **Result**: When a man has a strong sense of self-worth (Self-Alignment), his attempts to start a conversation (Initiation) come across as genuine and confident rather than needy or contrived.

### ⚖️ Trade-off: The Pacing Dilemma
*   **Interaction**: \`Connection\` vs. \`Transition\`
*   **Result**: Rushing to define the relationship (Transition) before a sufficient foundation of trust and rapport has been built (Connection) can scare the other person away.

### 🔗 Dependency: The Gateway Principle
*   **Interaction**: \`Initiation\` → \`Connection\`
*   **Result**: A successful Initiation is an absolute prerequisite for the Connection phase.

### 🔁 Feedback Loop: The Confidence Spiral
*   **Interaction**: \`Self-Alignment\` → \`Initiation\` → \`Connection\` → \`Self-Alignment\`
*   **Result**: Strong Self-Alignment leads to more successful Initiations. Positive Initiations create opportunities for Connection.`

export default function Test3DV2Page() {
  const framework = parseUniversalFramework(sampleMarkdown)
  const sceneData = mapUniversalFrameworkTo3D(framework)
  
  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="p-4 border-b bg-gradient-to-r from-slate-900 to-slate-800">
        <div>
          <h1 className="text-xl font-bold mb-1 text-white flex items-center gap-2">
            ⭐ 优化版 - 立即可用 + 渐进展示
          </h1>
          <p className="text-xs text-slate-400">
            基于最佳实践：0秒等待 • Hover展开 • 点击聚焦 • 可选系统动态
          </p>
        </div>
        
        <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
          <div className="bg-green-500/10 p-2 rounded border border-green-500/20">
            <div className="font-semibold text-green-400 mb-1">✅ 立即可用</div>
            <div className="text-slate-400 text-[10px]">0秒等待，立即交互</div>
          </div>
          <div className="bg-blue-500/10 p-2 rounded border border-blue-500/20">
            <div className="font-semibold text-blue-400 mb-1">✅ 渐进展示</div>
            <div className="text-slate-400 text-[10px]">Hover/点击才显示细节</div>
          </div>
          <div className="bg-purple-500/10 p-2 rounded border border-purple-500/20">
            <div className="font-semibold text-purple-400 mb-1">✅ 性能优先</div>
            <div className="text-slate-400 text-[10px]">60fps流畅体验</div>
          </div>
        </div>
      </div>
      
      <div className="flex-1">
        <UniversalFrameworkOptimized 
          data={sceneData}
          onNodeClick={(node) => {
            console.log('Satellite clicked:', node)
            alert(`📌 ${node.label}\n\n💡 ${node.description}`)
          }}
        />
      </div>
    </div>
  )
}

