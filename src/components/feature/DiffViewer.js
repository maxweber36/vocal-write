/**
 * @file DiffViewer.js
 * @description This file contains the component for viewing differences between two texts.
 */

import React from 'react'
import ReactDiffViewer from 'react-diff-viewer'

/**
 * A component to display the differences between old and new text.
 * @param {{oldText: string, newText: string}} props The props for the component.
 * @returns {React.ReactElement} The DiffViewer component.
 */
const DiffViewer = ({ oldText, newText }) => {
  return (
    <ReactDiffViewer
      oldValue={oldText}
      newValue={newText}
      splitView={true}
      hideLineNumbers={true}
      showDiffOnly={false}
    />
  )
}

export default DiffViewer
