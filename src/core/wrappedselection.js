// This module creates a selection object wrapper that conforms as closely as possible to the Selection specification
// in the HTML Editing spec (http://dvcs.w3.org/hg/editing/raw-file/tip/editing.html#selections)
/* build:replaceWith(api) */rangy/* build:replaceEnd */.createCoreModule("WrappedSelection", ["DomRange", "WrappedRange"], function(api, module) {
    api.config.checkSelectionRanges = true;
    // Utility function to support direction parameters in the API that may be a string ("backward" or "forward") or a
    // Boolean (true for backwards).
    function isDirectionBackward(dir) {
        return (typeof dir == "string") ? /^backward(s)?$/i.test(dir) : !!dir;
    }

    function WrappedSelection(selection, docSelection, win) {
    }

    WrappedSelection.isDirectionBackward = isDirectionBackward;

    api.Selection = WrappedSelection;
});
