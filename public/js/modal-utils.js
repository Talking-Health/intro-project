/**
 * Show a custom confirmation dialog
 * @param {string} message - The confirmation message to display
 * @returns {Promise<boolean>} - Resolves to true if confirmed, false if canceled
 */
export function showConfirmDialog( message ) {
  return new Promise( ( resolve ) => {
    const modal = document.getElementById( "confirmModal" )
    const messageElement = document.getElementById( "confirmMessage" )
    const confirmButton = document.getElementById( "confirmDelete" )
    const cancelButton = document.getElementById( "confirmCancel" )

    // Set the message
    messageElement.textContent = message

    // Show the modal
    modal.style.display = "flex"

    // Handle confirm button click
    const handleConfirm = () => {
      modal.style.display = "none"
      cleanup()
      resolve( true )
    }

    // Handle cancel button click
    const handleCancel = () => {
      modal.style.display = "none"
      cleanup()
      resolve( false )
    }

    // Handle escape key
    const handleKeydown = ( e ) => {
      if( "Escape" === e.key ) {
        handleCancel()
      }
    }

    // Handle click outside modal
    const handleOverlayClick = ( e ) => {
      if( e.target === modal ) {
        handleCancel()
      }
    }

    // Clean up event listeners
    const cleanup = () => {
      confirmButton.removeEventListener( "click", handleConfirm )
      cancelButton.removeEventListener( "click", handleCancel )
      document.removeEventListener( "keydown", handleKeydown )
      modal.removeEventListener( "click", handleOverlayClick )
    }

    // Add event listeners
    confirmButton.addEventListener( "click", handleConfirm )
    cancelButton.addEventListener( "click", handleCancel )
    document.addEventListener( "keydown", handleKeydown )
    modal.addEventListener( "click", handleOverlayClick )

    // Focus the cancel button by default
    cancelButton.focus()
  } )
}