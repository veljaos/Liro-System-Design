'use client'

import { useCallback } from 'react'
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react'
import { Box, Text } from '@mantine/core'
import { liroVar, type StatusToneName } from '@liro/tokens'

/**
 * Process diagram.
 *
 * The previous version drew steps by hand, in array order. That worked while
 * processes were linear, but as soon as a branch with two paths that later
 * merge appears, a manual layout stops being readable.
 *
 * This is React Flow: layout, dragging, zooming, and connections that draw
 * themselves. What remains ours is colors, shapes, and meaning — a node still
 * receives `kind`, not `style`, same as a button receiving `intent`.
 *
 * Still NOT full BPMN with pools and events. It covers what a diagram in a
 * business application is drawn for: who does what, where the branches are,
 * and where the record currently is.
 */

export type ProcessNodeKind = 'start' | 'task' | 'decision' | 'end' | 'system'

export interface ProcessNodeData extends Record<string, unknown> {
  label: string
  kind: ProcessNodeKind
  /** Who executes the step — role, department, system. */
  lane?: string
  /** Current step — highlighted. */
  active?: boolean
  /** The step is done. */
  done?: boolean
  /** Extra data: deadline, assignee, number of pending items. */
  meta?: string
}

const KIND_TONE: Record<ProcessNodeKind, StatusToneName> = {
  start: 'info',
  task: 'neutral',
  decision: 'warning',
  end: 'success',
  system: 'premium',
}

/**
 * Shape carries meaning, same as in the manual version: rounded is start and
 * end, a rectangle is a task, skewed is a decision, dashed is a system step.
 */
function ProcessNodeView({ data }: NodeProps) {
  const node = data as ProcessNodeData
  const tone = liroVar.status[KIND_TONE[node.kind]]
  const terminal = node.kind === 'start' || node.kind === 'end'
  const decision = node.kind === 'decision'

  return (
    <>
      <Handle type="target" position={Position.Left} style={{ background: liroVar.border.strong, width: 6, height: 6 }} />

      <Box
        px="sm"
        py={8}
        style={{
          minWidth: 132,
          textAlign: 'center',
          backgroundColor: node.active ? tone.bg : node.done ? liroVar.surface.sunken : liroVar.surface.raised,
          border: `${node.active ? 2 : 1}px ${node.kind === 'system' ? 'dashed' : 'solid'} ${
            node.active ? tone.fg : liroVar.border.default
          }`,
          borderRadius: terminal ? 'var(--liro-radius-full)' : decision ? 'var(--liro-radius-xs)' : 'var(--liro-radius-md)',
          transform: decision ? 'skewX(-8deg)' : undefined,
          opacity: node.done && !node.active ? 0.7 : 1,
          boxShadow: node.active ? 'var(--liro-shadow-md)' : undefined,
        }}
      >
        <Box style={{ transform: decision ? 'skewX(8deg)' : undefined }}>
          {node.lane && (
            <Text size="xs" style={{ color: liroVar.text.tertiary, lineHeight: 1.2 }}>
              {node.lane}
            </Text>
          )}
          <Text size="xs" fw={node.active ? 700 : 500} style={{ lineHeight: 1.3 }}>
            {node.label}
          </Text>
          {node.meta && (
            <Text size="xs" style={{ color: tone.fg, lineHeight: 1.2 }}>{node.meta}</Text>
          )}
        </Box>
      </Box>

      <Handle type="source" position={Position.Right} style={{ background: liroVar.border.strong, width: 6, height: 6 }} />
    </>
  )
}

const nodeTypes = { liro: ProcessNodeView }

export interface ProcessDiagramProps {
  nodes: Node<ProcessNodeData>[]
  edges: Edge[]
  height?: number | string
  /** Allows moving nodes — for a process editor. */
  editable?: boolean
  withMiniMap?: boolean
  onNodeClick?: (node: Node<ProcessNodeData>) => void
}

function ProcessDiagramInner({
  nodes: initialNodes,
  edges: initialEdges,
  height = 420,
  editable = false,
  withMiniMap = false,
  onNodeClick,
}: ProcessDiagramProps) {
  const [nodes, , onNodesChange] = useNodesState(
    initialNodes.map((node) => ({ ...node, type: 'liro' })),
  )
  const [edges, , onEdgesChange] = useEdgesState(
    initialEdges.map((edge) => ({
      ...edge,
      /* An arrowhead at the end is required: without it the flow direction is
         not visible, and direction is the whole point of a process diagram. */
      markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
      style: { stroke: liroVar.border.strong, strokeWidth: 1.5 },
      labelStyle: { fontSize: 11, fill: liroVar.text.secondary },
      labelBgStyle: { fill: liroVar.surface.page },
      labelBgPadding: [4, 2] as [number, number],
      labelBgBorderRadius: 3,
    })),
  )

  const handleNodeClick = useCallback(
    (_: unknown, node: Node) => onNodeClick?.(node as Node<ProcessNodeData>),
    [onNodeClick],
  )

  return (
    <Box h={height} style={{ borderRadius: 'var(--liro-radius-lg)', overflow: 'hidden' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={editable ? onNodesChange : undefined}
        onEdgesChange={editable ? onEdgesChange : undefined}
        onNodeClick={handleNodeClick}
        nodesDraggable={editable}
        nodesConnectable={editable}
        elementsSelectable={Boolean(onNodeClick) || editable}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        proOptions={{ hideAttribution: false }}
        style={{ backgroundColor: liroVar.surface.page }}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color={liroVar.border.default} />
        <Controls showInteractive={editable} />
        {withMiniMap && (
          <MiniMap
            pannable
            zoomable
            style={{ backgroundColor: liroVar.surface.sunken }}
            nodeColor={(node) =>
              liroVar.status[KIND_TONE[(node.data as ProcessNodeData).kind]].solid
            }
          />
        )}
      </ReactFlow>
    </Box>
  )
}

/** React Flow requires its own provider; the wrapper sets it up so the application does not have to. */
export function ProcessDiagram(props: ProcessDiagramProps) {
  return (
    <ReactFlowProvider>
      <ProcessDiagramInner {...props} />
    </ReactFlowProvider>
  )
}

/**
 * Builds nodes and edges from a linear description with branching.
 *
 * Exists so the application does not need to compute coordinates. What
 * happens is described, and the layout is a consequence: steps go rightward,
 * decision branches go up and down.
 */
export interface SimpleStep {
  id: string
  label: string
  kind: ProcessNodeKind
  lane?: string
  active?: boolean
  done?: boolean
  meta?: string
  /** Branches from a decision — each leads to `to` with a label. */
  branches?: { label: string; to: string }[]
  /** Next step when there is no branching. */
  next?: string
}

export function buildProcess(steps: SimpleStep[]): {
  nodes: Node<ProcessNodeData>[]
  edges: Edge[]
} {
  const columnWidth = 190
  const rowHeight = 96
  const column = new Map<string, number>()
  const row = new Map<string, number>()

  /* The column is depth from the start; the row shifts only on branching. */
  const place = (id: string, depth: number, offset: number) => {
    if (column.has(id)) {
      column.set(id, Math.max(column.get(id) ?? 0, depth))
      return
    }
    column.set(id, depth)
    row.set(id, offset)

    const step = steps.find((item) => item.id === id)
    if (!step) return

    if (step.branches?.length) {
      step.branches.forEach((branch, index) => {
        const spread = step.branches!.length - 1
        place(branch.to, depth + 1, offset + (index - spread / 2) * 1.2)
      })
    } else if (step.next) {
      place(step.next, depth + 1, offset)
    }
  }

  const first = steps[0]
  if (first) place(first.id, 0, 0)

  const nodes: Node<ProcessNodeData>[] = steps.map((step) => ({
    id: step.id,
    type: 'liro',
    position: {
      x: (column.get(step.id) ?? 0) * columnWidth,
      y: (row.get(step.id) ?? 0) * rowHeight,
    },
    data: {
      label: step.label,
      kind: step.kind,
      lane: step.lane,
      active: step.active,
      done: step.done,
      meta: step.meta,
    },
  }))

  const edges: Edge[] = steps.flatMap((step) => {
    if (step.branches?.length) {
      return step.branches.map((branch) => ({
        id: `${step.id}-${branch.to}`,
        source: step.id,
        target: branch.to,
        label: branch.label,
      }))
    }
    if (step.next) {
      return [{ id: `${step.id}-${step.next}`, source: step.id, target: step.next }]
    }
    return []
  })

  return { nodes, edges }
}

export type { Edge, Node }
