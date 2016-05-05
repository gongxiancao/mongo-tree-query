
// each tree node has a attribute pathName, which in format of { pathName: '/aaa/bbb', action: 'include'/'exclude'}
function Query (rules) {
  this._compileSelections(rules);
}

function explainSelectionTreeNodesAsIfStatments (treeNodes) {
  var lines = [];
  (treeNodes || []).forEach(function (node) {
    lines.push('if(' + node.pathName + ') {');
    var childLines = explainSelectionTreeNodesAsIfStatments(node._children);
    childLines.forEach(function (line) {
      lines.push('  ' + line);
    });
    lines.push('  return ' + (node.action === 'include'));
    lines.push('}');
  });

  return lines;
}

function compileSelectionTreeToQuery (node) {
  var query = {};
  var ands = query.$and = [];
  if(!node._children) {
    ands.push({pathName: {$regex: '^' + node.pathName}});
    if(node.action === 'exclude') {
      ands.push({pathName: null});
    }
    return query;
  }
  ands.push({pathName: {$regex: '^' + node.pathName}});

  var ors = [];
  ands.push({$or: ors});

  node._children.forEach(function (child) {
    var childQuery = compileSelectionTreeToQuery(child);
    ors.push(childQuery);
  });

  var elseCases = node._children.map(function (child) {
    return {pathName: {$not: {$regex: '^' + child.pathName}}};
  });
  if(node.action === 'include') {
    ors.push({
      $and: elseCases
    });
  } else {
    // force negative
    ors.push({
      pathName: null
    });
  }

  return query;
}

function compileSelectionTreeNodesToQuery (treeNodes) {
  var query = {};
  var ors = query.$or = [];
  treeNodes.forEach(function (node) {
    ors.push(compileSelectionTreeToQuery(node));
  });

  return query;
}

Query.prototype._compileSelections = function (selections) {
  var selectionMemo = {};

  selections.forEach(function (selection) {
    selectionMemo[selection.pathName] = selection;
    delete selection._parent;
    delete selection._children;
  });

  selections.forEach(function (selection) {
    var pathParts = selection.pathName.split('/');
    pathParts.shift();

    for(var i = pathParts.length - 1; i > 0; i--) {
      var pathName = '/' + pathParts.slice(0, i).join('/');
      console.log(pathName);
      var parent = selectionMemo[pathName];

      if(parent) {
        selection._parent = parent;
        parent._children = parent._children || [];
        parent._children.push(selection);
        break;
      }
    }
  });

  var selectionTreeRoots = selections.reduce(function (result, selection) {
    if(!selection._parent) {
      result.push(selection);
    }
    return result;
  }, []);

  // console.log(JSON.stringify(selectionTreeRoots, '  ', 2));

  this.explanation = explainSelectionTreeNodesAsIfStatments(selectionTreeRoots).join('\n');

  this.query = compileSelectionTreeNodesToQuery(selectionTreeRoots);
};


module.exports = Query;