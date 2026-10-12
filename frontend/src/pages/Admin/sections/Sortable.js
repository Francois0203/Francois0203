import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor,
  useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, arrayMove, useSortable, sortableKeyboardCoordinates,
  verticalListSortingStrategy, rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import formStyles from '../AdminForms.module.css';

export const DragHandle = ({ label = 'Drag to reorder', ...props }) => (
  <button type="button" className={formStyles.handle} aria-label={label} {...props}>
    <svg viewBox="0 0 12 18" aria-hidden="true">
      {[3, 9, 15].map(y => (
        <g key={y}><circle cx="3" cy={y} r="1.4" /><circle cx="9" cy={y} r="1.4" /></g>
      ))}
    </svg>
  </button>
);

const Item = ({ id, className, render }) => {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };
  const handle = { ref: setActivatorNodeRef, ...attributes, ...listeners };
  return (
    <div ref={setNodeRef} style={style} className={className} data-dragging={isDragging ? '' : undefined}>
      {render(handle)}
    </div>
  );
};

export const SortableList = ({
  items,
  getId,
  onReorder,
  layout = 'list',
  className,
  itemClassName,
  children,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const ids = items.map((item, i) => getId(item, i));

  const onDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(active.id);
    const to = ids.indexOf(over.id);
    if (from < 0 || to < 0) return;
    onReorder(arrayMove(items, from, to));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={ids} strategy={layout === 'wrap' ? rectSortingStrategy : verticalListSortingStrategy}>
        <div className={className}>
          {items.map((item, i) => (
            <Item
              key={ids[i]}
              id={ids[i]}
              className={itemClassName}
              render={(handle) => children(item, i, handle)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

/* Stable ids for plain arrays held in local state, stripped before saving. */
let seq = 0;
export const withIds = (list = []) => list.map(v => ({ ...v, _id: `k${(seq += 1)}` }));
export const stripIds = (list = []) => list.map(({ _id, ...rest }) => rest);
