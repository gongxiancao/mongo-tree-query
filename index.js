

// each tree node has a attribute pathName, which in format of { criteria: {pathName: '/aaa/bbb', brand: 'KFC'}, action: 'include'/'exclude'}
function Query (rules) {
  this._compileSelections(rules);
}

function explainSelectionTreeNodesAsIfStatments (treeNodes) {
  var lines = [];
  (treeNodes || []).forEach(function (node) {
    lines.push('if(' + JSON.stringify(node.rule.criteria) + ') {');
    var childLines = explainSelectionTreeNodesAsIfStatments(node._children);
    childLines.forEach(function (line) {
      lines.push('  ' + line);
    });
    lines.push('  return ' + (node.rule.action === 'include'));
    lines.push('}');
  });

  return lines;
}

function extend (obj1, obj2) {
  for(var key in obj2) {
    obj1[key] = obj2[key];
  }
  return obj1;
}

function compileSelectionTreeToQuery (node) {
  var query = {};
  var ands = query.$and = [];

  var nodeQueryExp = extend({}, node.rule.criteria);
  nodeQueryExp.pathName = {$regex: '^' + node.rule.criteria.pathName};

  if(!node._children) {
    ands.push(nodeQueryExp);
    if(node.rule.action === 'exclude') {
      ands.push({pathName: null});
    }
    return query;
  }
  ands.push(nodeQueryExp);

  var ors = [];
  ands.push({$or: ors});

  node._children.forEach(function (child) {
    var childQuery = compileSelectionTreeToQuery(child);
    ors.push(childQuery);
  });

  var elseCases = node._children.map(function (child) {
    var childQueryExp = extend({}, child.rule.criteria);
    childQueryExp.pathName = {$regex: '^' + child.rule.criteria.pathName};
    return childQueryExp;
  });

  // --------    --------    --------            --------------------------------------
  // P1 && B1 && P2 && B2 && P3 && B3  <======>  (P1 && B1) || (P2 && B2) || (P3 && B3)
  // {$and: [{$nor: [{P1, B1}]}, {$nor: [{P2, B2}]}, {$nor: [{P3, B3}]}]} <=====> {$nor: [{P1, B1}, {P2, B2}, {P3, B3}]}
  if(node.rule.action === 'include') {
    ors.push({
      $nor: elseCases
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

Query.prototype._compileSelections = function (rules) {
  var selectionNodes = rules.map(function (rule) {
    return {rule: rule, _parent: null, _children: null};
  });

  var selectionNodeMemo = {};
  selectionNodes.forEach(function (selectionNode) {
    selectionNodeMemo[selectionNode.rule.criteria.pathName] = selectionNode;
  });

  selectionNodes.forEach(function (selectionNode) {
    var pathParts = selectionNode.rule.criteria.pathName.split('/');
    pathParts.shift();

    for(var i = pathParts.length - 1; i > 0; i--) {
      var pathName = '/' + pathParts.slice(0, i).join('/');
      var parent = selectionNodeMemo[pathName];

      if(parent) {
        selectionNode._parent = parent;
        parent._children = parent._children || [];
        parent._children.push(selectionNode);
        break;
      }
    }
  });

  var selectionTreeRoots = selectionNodes.reduce(function (result, selectionNode) {
    if(!selectionNode._parent) {
      result.push(selectionNode);
    }
    return result;
  }, []);

  // console.log(JSON.stringify(selectionTreeRoots, '  ', 2));

  this.explanation = explainSelectionTreeNodesAsIfStatments(selectionTreeRoots).join('\n');

  this.query = compileSelectionTreeNodesToQuery(selectionTreeRoots);
};


module.exports = Query;