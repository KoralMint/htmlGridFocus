var grabbed = {
    item: null,
    offset_x: 0,
    offset_y: 0,
    placeable: false
}

function setEventLisners() {
    // grid items
    var grid_items = Array.from(document.getElementsByClassName('grid_item'));
    grid_items.forEach(item => {
        if (item.id == 'preview') return;
        initGridItem(item);
    });

    // global
    document.addEventListener('dragover', function(e) {
        if (!grabbed.item==null) return;
        var gridPos = updateCursorGridPos(e, grid_area, grabbed.item);
        updatePreview(gridPos, true);
    });
    document.addEventListener('dragend', function(e) {
        updatePreview({}, false);
        if (grabbed.item != null) {
            grabbed.item.style.opacity = '1';
        }
    });

    // grid area
    var grid_area = document.getElementById('grid_area');
    grid_area.addEventListener('dragover', function(e) {
        e.preventDefault();
    });
    grid_area.addEventListener('drop', function(e) {
        e.preventDefault();

        var item = grabbed.item;
        grabbed.item = null;
        if (item == null) return;
        
        var gridPos = updateCursorGridPos(e, grid_area, item);
        
        if (grabbed.placeable) {
        
            if (item.classList.contains('template')) {
                deployGridItem(item, gridPos);
            } else {
                moveGridItem(item, gridPos);
            }
        }
        item.style.opacity = '1';
        updatePreview({}, false);
    });

    // trash area
    var trash_area = document.getElementById('trash_area');
    trash_area.addEventListener('dragover', function(e) {
        e.preventDefault();
    });
    trash_area.addEventListener('drop', function(e) {
        var item = grabbed.item;

        if (!item.classList.contains('template')) {
            item.remove();
        }
        updatePreview({}, false);
    });

}

function initGridItem(item) {
    item.setAttribute('draggable', 'true');
    item.addEventListener('dragstart', function(e) {
        grabbed.item = item;
        if (!item.classList.contains('template'))
            item.style.opacity = '0.7';

        var rect = item.getBoundingClientRect();
        grabbed.offset_x = e.clientX - rect.left;
        grabbed.offset_y = e.clientY - rect.top;
    });
}

function updateCursorGridPos(event, grid, item){
    const rect = grid.getBoundingClientRect();
    var gridPos = {};
    const computedStyle = getComputedStyle(grid);
    const gridColumns = parseInt(computedStyle.gridTemplateColumns.trim().split(' ').length);
    const gridRows = parseInt(computedStyle.gridTemplateRows.trim().split(' ').length);
    const itemColumns = parseInt(getComputedStyle(item).getPropertyValue('--width'));
    const itemRows = parseInt(getComputedStyle(item).getPropertyValue('--height'));

    gridPos.x = 
        // position + centering & adjustment
        Math.floor(
        (event.clientX - grabbed.offset_x - rect.left
         + parseFloat(computedStyle.gridTemplateColumns.trim().split(' ')[0])/2
         - parseFloat(computedStyle.paddingLeft)
         - parseFloat(computedStyle.borderLeftWidth)
        ) / (parseFloat(computedStyle.gridTemplateColumns.trim().split(' ')[0]) // note: not portable for variable grid size
         + parseFloat(computedStyle.columnGap))
    );
    gridPos.y = 
        // position + centering & adjustment
        Math.floor(
        (event.clientY - grabbed.offset_y - rect.top
         + parseFloat(computedStyle.gridTemplateRows.trim().split(' ')[0])/2
         - parseFloat(computedStyle.paddingTop)
         - parseFloat(computedStyle.borderTopWidth)
        ) / (parseFloat(computedStyle.gridTemplateRows.trim().split(' ')[0]) // note: not portable for variable grid size
         + parseFloat(computedStyle.rowGap))
    );

    // check if too over the edge
    if (gridPos.x < -1 || gridPos.y < -1 || gridPos.x > gridColumns-itemColumns+1 || gridPos.y > gridRows-itemRows+1) {
        grabbed.placeable = false;
    } else {
        grabbed.placeable = true;
    }

    // bound to grid
    gridPos.x = Math.max(0, Math.min(gridColumns-itemColumns, gridPos.x)) +1;
    gridPos.y = Math.max(0, Math.min(gridRows-itemRows, gridPos.y)) +1;
    

    return gridPos;
}

function deployGridItem(item, gridPos) {
    var widget = item.cloneNode(true);
    widget.classList.remove('template');
    initGridItem(widget);
    grid_area.appendChild(widget);
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

function updatePreview(gridPos, visible=true) {

    var preview = document.getElementById('preview'); 
    if(!grabbed.placeable || grabbed.item == null || !visible) {
        preview.style.display = 'none';
        return;
    }
    preview.style.display = 'block';

    const itemColumns = parseInt(getComputedStyle(grabbed.item).getPropertyValue('--width'));
    const itemRows = parseInt(getComputedStyle(grabbed.item).getPropertyValue('--height'));
    preview.style.gridColumnStart = gridPos.x;
    preview.style.gridRowStart = gridPos.y;
    preview.style.gridColumnEnd = gridPos.x + itemColumns;
    preview.style.gridRowEnd = gridPos.y + itemRows;

}