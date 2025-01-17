function createDragState() {
    return {
        item: null,
        offset_x: 0,
        offset_y: 0,
        placeable: false
    };
}

function setEventListeners() {
    const gridItems = Array.from(document.getElementsByClassName('grid_item'));
    gridItems.forEach(item => {
        initGridItem(item);
    });

    document.addEventListener('dragover', handleGlobalDragOver);
    document.addEventListener('dragend', handleGlobalDragEnd);

    const gridArea = document.getElementById('grid_area');
    gridArea.addEventListener('dragover', preventDefault);
    gridArea.addEventListener('drop', handleGridAreaDrop);

    const trashArea = document.getElementById('trash_area');
    trashArea.addEventListener('dragover', preventDefault);
    trashArea.addEventListener('drop', handleTrashAreaDrop);
}

function initGridItem(item) {
    item.setAttribute('draggable', 'true');
    item.addEventListener('dragstart', handleDragStart);
}

function handleDragStart(e) {
    const dragState = createDragState();
    dragState.item = e.target;
    if (!dragState.item.classList.contains('template')) {
        dragState.item.style.opacity = '0.7';
    }

    const rect = dragState.item.getBoundingClientRect();
    dragState.offset_x = e.clientX - rect.left;
    dragState.offset_y = e.clientY - rect.top;

    document.dragState = dragState;
}

function handleGlobalDragOver(e) {
    const dragState = document.dragState;
    if (!dragState || !dragState.item) return;
    const gridArea = document.getElementById('grid_area');
    const gridPos = updateCursorGridPos(e, gridArea, dragState);
    updatePreview(gridPos, true);
}

function handleGlobalDragEnd() {
    const dragState = document.dragState;
    updatePreview({}, false);
    if (dragState && dragState.item) {
        dragState.item.style.opacity = '1';
    }
    document.dragState = null;
}

function handleGridAreaDrop(e) {

    const dragState = document.dragState;
    const item = dragState.item;
    document.dragState = null;
    if (!item) return;

    const gridArea = document.getElementById('grid_area');
    const gridPos = updateCursorGridPos(e, gridArea, dragState);

    if (dragState.placeable) {
        e.preventDefault();
        if (item.classList.contains('template')) {
            deployGridItem(item, gridPos);
        } else {
            moveGridItem(item, gridPos);
        }
    }
    item.style.opacity = '1';
    updatePreview({}, false);
}

function handleTrashAreaDrop() {
    const dragState = document.dragState;
    const item = dragState.item;
    if (!item.classList.contains('template')) {
        item.remove();
    }
    updatePreview({}, false);
    document.dragState = null;
}

function preventDefault(e) {
    e.preventDefault();
}

function updateCursorGridPos(event, grid, dragState) {
    const rect = grid.getBoundingClientRect();
    const computedStyle = getComputedStyle(grid);
    const gridColumns = parseInt(computedStyle.gridTemplateColumns.trim().split(' ').length);
    const gridRows = parseInt(computedStyle.gridTemplateRows.trim().split(' ').length);
    const itemColumns = parseInt(getComputedStyle(dragState.item).getPropertyValue('--width'));
    const itemRows = parseInt(getComputedStyle(dragState.item).getPropertyValue('--height'));

    const gridPos = {
        x: Math.floor(
            (event.clientX - dragState.offset_x - rect.left +
            parseFloat(computedStyle.gridTemplateColumns.trim().split(' ')[0]) / 2 -
            parseFloat(computedStyle.paddingLeft) -
            parseFloat(computedStyle.borderLeftWidth)) /
            (parseFloat(computedStyle.gridTemplateColumns.trim().split(' ')[0]) +
            parseFloat(computedStyle.columnGap))
        ),
        y: Math.floor(
            (event.clientY - dragState.offset_y - rect.top +
            parseFloat(computedStyle.gridTemplateRows.trim().split(' ')[0]) / 2 -
            parseFloat(computedStyle.paddingTop) -
            parseFloat(computedStyle.borderTopWidth)) /
            (parseFloat(computedStyle.gridTemplateRows.trim().split(' ')[0]) +
            parseFloat(computedStyle.rowGap))
        )
    };

    dragState.placeable = !(gridPos.x < -1 || gridPos.y < -1 || gridPos.x > gridColumns - itemColumns + 1 || gridPos.y > gridRows - itemRows + 1);

    gridPos.x = Math.max(0, Math.min(gridColumns - itemColumns, gridPos.x)) + 1;
    gridPos.y = Math.max(0, Math.min(gridRows - itemRows, gridPos.y)) + 1;

    return gridPos;
}

function deployGridItem(item, gridPos) {
    const widget = item.cloneNode(true);
    widget.classList.remove('template');
    initGridItem(widget);
    document.getElementById('grid_area').appendChild(widget);
    moveGridItem(widget, gridPos);
}

function moveGridItem(item, gridPos) {
    const itemColumns = parseInt(getComputedStyle(item).getPropertyValue('--width'));
    const itemRows = parseInt(getComputedStyle(item).getPropertyValue('--height'));
    item.style.gridColumnStart = gridPos.x;
    item.style.gridRowStart = gridPos.y;
    item.style.gridColumnEnd = gridPos.x + itemColumns;
    item.style.gridRowEnd = gridPos.y + itemRows;
}

function updatePreview(gridPos, visible = true) {
    const dragState = document.dragState;
    const preview = document.getElementById('preview');
    if (!visible || !dragState || !dragState.placeable || !dragState.item) {
        preview.style.display = 'none';
        return;
    }
    preview.style.display = 'block';

    const itemColumns = parseInt(getComputedStyle(dragState.item).getPropertyValue('--width'));
    const itemRows = parseInt(getComputedStyle(dragState.item).getPropertyValue('--height'));
    preview.style.gridColumnStart = gridPos.x;
    preview.style.gridRowStart = gridPos.y;
    preview.style.gridColumnEnd = gridPos.x + itemColumns;
    preview.style.gridRowEnd = gridPos.y + itemRows;
}
