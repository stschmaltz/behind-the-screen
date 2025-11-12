import { NextPage } from 'next';
import Head from 'next/head';
import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { FormInput } from '../../components/ui/FormInput';
import { showDaisyToast } from '../../lib/daisy-toast';
import { generateMongoId } from '../../lib/mongo';

interface LootItem {
  _id: string;
  name: string;
  description: string;
  quantity: number;
  cost: number; // Cost per unit
}

// Modal types for clarity
type ModalMode =
  | 'addAdventure'
  | 'editAdventure'
  | 'editParty'
  | 'moveToParty'
  | 'sellParty';

const LootTrackerPage: NextPage = () => {
  const [adventureLootItems, setAdventureLootItems] = useState<LootItem[]>([]);
  const [partyLootItems, setPartyLootItems] = useState<LootItem[]>([]);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<ModalMode | null>(null);
  const [currentItem, setCurrentItem] = useState<
    (Partial<LootItem> & { originalId?: string }) | null
  >(null); // originalId for moving/selling
  const [transferQuantity, setTransferQuantity] = useState<number>(1);

  const openModal = (
    mode: ModalMode,
    item?: LootItem,
    _currentList?: 'adventure' | 'party',
  ) => {
    setModalMode(mode);
    if (mode === 'addAdventure') {
      setCurrentItem({ name: '', description: '', quantity: 1, cost: 0 });
    } else if (item) {
      setCurrentItem({ ...item, originalId: item._id }); // Store original ID for updates
      if (mode === 'moveToParty' || mode === 'sellParty') {
        setTransferQuantity(1); // Reset quantity for selling/moving
      }
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
    setModalMode(null);
    setTransferQuantity(1);
  };

  const handleSaveAdventureItem = () => {
    if (
      !currentItem ||
      !currentItem.name ||
      currentItem.quantity == null ||
      currentItem.cost == null
    ) {
      showDaisyToast('error', 'Name, Quantity, and Cost are required.');

      return;
    }
    if (currentItem.quantity <= 0 || currentItem.cost < 0) {
      showDaisyToast(
        'error',
        'Quantity must be positive and cost non-negative.',
      );

      return;
    }

    if (currentItem._id && modalMode === 'editAdventure') {
      // Editing existing adventure item
      setAdventureLootItems(
        adventureLootItems.map((item) =>
          item._id === currentItem.originalId
            ? ({ ...item, ...currentItem, _id: item._id } as LootItem)
            : item,
        ),
      );
      showDaisyToast('success', 'Adventure item updated');
    } else {
      // Adding new adventure item
      const newItemWithId: LootItem = {
        _id: generateMongoId(),
        name: currentItem.name!,
        description: currentItem.description || '',
        quantity: currentItem.quantity!,
        cost: currentItem.cost!,
      };
      setAdventureLootItems([...adventureLootItems, newItemWithId]);
      showDaisyToast('success', 'Adventure item added');
    }
    closeModal();
  };

  const handleSavePartyItem = () => {
    // For editing party items directly
    if (
      !currentItem ||
      !currentItem.name ||
      currentItem.quantity == null ||
      currentItem.cost == null ||
      !currentItem.originalId
    ) {
      showDaisyToast('error', 'Invalid item data for update.');

      return;
    }
    if (currentItem.quantity <= 0 || currentItem.cost < 0) {
      showDaisyToast(
        'error',
        'Quantity must be positive and cost non-negative.',
      );

      return;
    }
    setPartyLootItems(
      partyLootItems.map((item) =>
        item._id === currentItem.originalId
          ? ({ ...item, ...currentItem, _id: item._id } as LootItem)
          : item,
      ),
    );
    showDaisyToast('success', 'Party item updated');
    closeModal();
  };

  const handleDeleteItem = (list: 'adventure' | 'party', _id: string) => {
    if (list === 'adventure') {
      setAdventureLootItems(
        adventureLootItems.filter((item) => item._id !== _id),
      );
      showDaisyToast('success', 'Adventure item deleted');
    } else {
      setPartyLootItems(partyLootItems.filter((item) => item._id !== _id));
      showDaisyToast('success', 'Party item deleted');
    }
  };

  const handleMoveToPartyStash = () => {
    if (!currentItem || !currentItem.originalId || transferQuantity <= 0) {
      showDaisyToast('error', 'Invalid item or quantity for transfer.');

      return;
    }
    const itemToMove = adventureLootItems.find(
      (item) => item._id === currentItem.originalId,
    );
    if (!itemToMove) {
      showDaisyToast('error', 'Item not found in adventure loot.');

      return;
    }
    if (transferQuantity > itemToMove.quantity) {
      showDaisyToast(
        'error',
        'Cannot move more items than available in adventure loot.',
      );

      return;
    }

    // Add to party loot
    const existingPartyItemIndex = partyLootItems.findIndex(
      (pi) => pi.name === itemToMove.name && pi.cost === itemToMove.cost,
    ); // Simple matching by name and cost
    if (existingPartyItemIndex > -1) {
      setPartyLootItems(
        partyLootItems.map((item, index) =>
          index === existingPartyItemIndex
            ? { ...item, quantity: item.quantity + transferQuantity }
            : item,
        ),
      );
    } else {
      setPartyLootItems([
        ...partyLootItems,
        { ...itemToMove, _id: generateMongoId(), quantity: transferQuantity },
      ]);
    }

    // Update adventure loot
    if (itemToMove.quantity === transferQuantity) {
      setAdventureLootItems(
        adventureLootItems.filter((item) => item._id !== itemToMove._id),
      );
    } else {
      setAdventureLootItems(
        adventureLootItems.map((item) =>
          item._id === itemToMove._id
            ? { ...item, quantity: item.quantity - transferQuantity }
            : item,
        ),
      );
    }
    showDaisyToast(
      'success',
      `${transferQuantity} ${itemToMove.name}(s) moved to party stash.`,
    );
    closeModal();
  };

  const handleSellPartyItem = () => {
    if (!currentItem || !currentItem.originalId || transferQuantity <= 0) {
      showDaisyToast('error', 'Invalid item or quantity for selling.');

      return;
    }
    const itemToSell = partyLootItems.find(
      (item) => item._id === currentItem.originalId,
    );
    if (!itemToSell) {
      showDaisyToast('error', 'Item not found in party stash.');

      return;
    }
    if (transferQuantity > itemToSell.quantity) {
      showDaisyToast(
        'error',
        'Cannot sell more items than available in party stash.',
      );

      return;
    }

    if (itemToSell.quantity === transferQuantity) {
      setPartyLootItems(
        partyLootItems.filter((item) => item._id !== itemToSell._id),
      );
    } else {
      setPartyLootItems(
        partyLootItems.map((item) =>
          item._id === itemToSell._id
            ? { ...item, quantity: item.quantity - transferQuantity }
            : item,
        ),
      );
    }
    showDaisyToast(
      'success',
      `${transferQuantity} ${itemToSell.name}(s) removed/sold from party stash.`,
    );
    closeModal();
  };

  const renderLootTable = (
    items: LootItem[],
    listType: 'adventure' | 'party',
  ) => (
    <div className="overflow-x-auto bg-base-100 shadow-md rounded-lg mb-8">
      <table className="table w-full">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th className="text-right">Qty</th>
            <th className="text-right">Unit Cost (GP)</th>
            <th className="text-right">Total Cost (GP)</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center py-4">
                No items in this list.
              </td>
            </tr>
          )}
          {items.map((item) => (
            <tr key={item._id} className="hover">
              <td>{item.name}</td>
              <td>{item.description}</td>
              <td className="text-right">{item.quantity}</td>
              <td className="text-right">{item.cost.toLocaleString()}</td>
              <td className="text-right">
                {(item.quantity * item.cost).toLocaleString()}
              </td>
              <td className="text-center">
                <div className="flex justify-center gap-1 flex-wrap">
                  {listType === 'adventure' && (
                    <Button
                      label="Move to Party"
                      onClick={() =>
                        openModal('moveToParty', item, 'adventure')
                      }
                      variant="info"
                      className="btn-xs"
                    />
                  )}
                  {listType === 'party' && (
                    <Button
                      label="Sell/Remove"
                      onClick={() => openModal('sellParty', item, 'party')}
                      variant="success"
                      className="btn-xs"
                    />
                  )}
                  <Button
                    label="Edit"
                    onClick={() =>
                      openModal(
                        listType === 'adventure'
                          ? 'editAdventure'
                          : 'editParty',
                        item,
                        listType,
                      )
                    }
                    variant="secondary"
                    className="btn-xs"
                  />
                  <Button
                    label="Delete"
                    onClick={() => handleDeleteItem(listType, item._id)}
                    variant="error"
                    className="btn-xs"
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      <Head>
        <title>Adventure & Party Loot Tracker | TRPG Management</title>
        <meta
          name="description"
          content="Manage pre-set adventure loot and track items collected by the party."
        />
        <meta
          name="keywords"
          content="Loot Tracker, Adventure Loot, Party Stash, RPG Treasure, Item Management"
        />
      </Head>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Loot Management</h1>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">Adventure Loot Pool</h2>
          <div className="flex justify-end mb-2">
            <Button
              label="Add Item to Adventure Loot"
              onClick={() => openModal('addAdventure')}
              variant="primary"
            />
          </div>
          {renderLootTable(adventureLootItems, 'adventure')}
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-3">Party Stash</h2>
          {/* Add to party stash directly button can be added here if needed */}
          {renderLootTable(partyLootItems, 'party')}
        </div>

        {isModalOpen && currentItem && (
          <div className="modal modal-open modal-bottom sm:modal-middle">
            <div className="modal-box relative">
              <Button
                label="Close"
                onClick={closeModal}
                className="btn btn-sm btn-circle absolute right-2 top-2"
              />
              <h3 className="font-bold text-lg mb-4">
                {modalMode === 'addAdventure' && 'Add New Adventure Item'}
                {modalMode === 'editAdventure' && 'Edit Adventure Item'}
                {modalMode === 'editParty' && 'Edit Party Item'}
                {modalMode === 'moveToParty' &&
                  `Move ${currentItem.name} to Party Stash`}
                {modalMode === 'sellParty' &&
                  `Sell/Remove ${currentItem.name} from Party Stash`}
              </h3>

              {(modalMode === 'addAdventure' ||
                modalMode === 'editAdventure' ||
                modalMode === 'editParty') && (
                <>
                  <FormInput
                    id="itemName"
                    label="Name*"
                    value={currentItem.name || ''}
                    onChange={(e) =>
                      setCurrentItem({ ...currentItem, name: e.target.value })
                    }
                    className="mb-4"
                  />
                  <div className="form-control mb-4">
                    <label htmlFor="itemDescription" className="label">
                      <span className="label-text">Description</span>
                    </label>
                    <textarea
                      id="itemDescription"
                      value={currentItem.description || ''}
                      onChange={(e) =>
                        setCurrentItem({
                          ...currentItem,
                          description: e.target.value,
                        })
                      }
                      className="textarea textarea-bordered h-24"
                      placeholder="Enter item description"
                    />
                  </div>
                  <FormInput
                    id="itemQuantity"
                    label="Quantity*"
                    type="number"
                    value={String(currentItem.quantity || 1)}
                    onChange={(e) =>
                      setCurrentItem({
                        ...currentItem,
                        quantity: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    min={1}
                    className="mb-4"
                  />
                  <FormInput
                    id="itemCost"
                    label="Cost per Unit (GP)*"
                    type="number"
                    value={String(currentItem.cost || 0)}
                    onChange={(e) =>
                      setCurrentItem({
                        ...currentItem,
                        cost: parseFloat(e.target.value) || 0,
                      })
                    }
                    min={0}
                    className="mb-4"
                  />
                </>
              )}

              {(modalMode === 'moveToParty' || modalMode === 'sellParty') && (
                <FormInput
                  id="transferQuantity"
                  label={`Quantity to ${modalMode === 'moveToParty' ? 'Move' : 'Sell/Remove'} (Max: ${currentItem.quantity})`}
                  type="number"
                  value={String(transferQuantity)}
                  onChange={(e) =>
                    setTransferQuantity(
                      Math.max(
                        1,
                        Math.min(
                          parseInt(e.target.value, 10) || 1,
                          currentItem.quantity || 1,
                        ),
                      ),
                    )
                  }
                  min={1}
                  max={currentItem.quantity || 1}
                  className="mb-4"
                />
              )}

              {/* Sell price input for 'sellParty' mode - reference only */}
              {modalMode === 'sellParty' &&
                currentItem &&
                typeof currentItem.cost === 'number' && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      Original Cost (for reference):
                    </p>
                    <p className="font-semibold">
                      {currentItem.cost.toLocaleString()} GP per unit
                    </p>
                  </div>
                )}

              <div className="modal-action mt-4">
                {(modalMode === 'addAdventure' ||
                  modalMode === 'editAdventure') && (
                  <Button
                    label="Save Adventure Item"
                    onClick={handleSaveAdventureItem}
                    variant="primary"
                  />
                )}
                {modalMode === 'editParty' && (
                  <Button
                    label="Save Party Item"
                    onClick={handleSavePartyItem}
                    variant="primary"
                  />
                )}
                {modalMode === 'moveToParty' && (
                  <Button
                    label="Confirm Move"
                    onClick={handleMoveToPartyStash}
                    variant="info"
                  />
                )}
                {modalMode === 'sellParty' && (
                  <Button
                    label="Confirm Sell/Remove"
                    onClick={handleSellPartyItem}
                    variant="success"
                  />
                )}
                <Button label="Cancel" onClick={closeModal} />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default LootTrackerPage;
