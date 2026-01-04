const db = require("../db");
const { v4: uuidv4 } = require('uuid');

// --- Helper Functions ---

/**
 * Logs an event to the box_history table.
 * @param {string} box_id - The ID of the bee box.
 * @param {string} event_type - The type of event (e.g., 'CREATED', 'STATUS_CHANGE').
 * @param {any} old_value - The previous value.
 * @param {any} new_value - The new value.
 * @param {number} recorded_by - The user ID of the person making the change.
 * @param {string} notes - Additional notes for the event.
 */
const logHistory = (box_id, event_type, old_value, new_value, recorded_by, notes = '') => {
  const sql = `
    INSERT INTO box_history (box_id, event_type, old_value, new_value, recorded_by, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [box_id, event_type, JSON.stringify(old_value), JSON.stringify(new_value), recorded_by, notes], (err) => {
    if (err) {
      console.error('Failed to log box history:', err);
    }
  });
};


// --- Controller Functions ---

// Get all bee boxes with basic info
exports.getAllBoxes = (req, res) => {
  const sql = "SELECT box_id, name, status, location, acquired_date, last_updated FROM bee_boxes ORDER BY created_at DESC";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching all boxes:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

// Get a single bee box by its ID
exports.getBoxById = (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM bee_boxes WHERE box_id = ?";
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error(`Error fetching box ${id}:`, err);
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Bee box not found." });
    }
    res.json(results[0]);
  });
};

// Add a new bee box
exports.addBox = (req, res) => {
  const { name, acquired_date, notes } = req.body;
  const user_id = req.user.id;
  const box_id = uuidv4();

  if (!name || !acquired_date) {
    return res.status(400).json({ message: "Missing required fields: name and acquired_date." });
  }

  const newBox = {
    box_id,
    name,
    acquired_date,
    notes
  };

  const sql = "INSERT INTO bee_boxes SET ?";
  db.query(sql, newBox, (err, result) => {
    if (err) {
      console.error("Error adding new box:", err);
      return res.status(500).json({ error: err.message });
    }
    logHistory(box_id, 'CREATED', null, newBox, user_id, `Box created with name: ${name}`);
    res.status(201).json({ message: "Bee box added successfully", box_id });
  });
};

// Update the general details of a bee box
exports.updateBoxDetails = (req, res) => {
  const { id } = req.params;
  const { name, acquired_date, notes } = req.body;
  const user_id = req.user.id;

  if (!name || !acquired_date) {
    return res.status(400).json({ message: "Missing required fields: name and acquired_date." });
  }

  const updates = { name, acquired_date, notes };

  const sql = "UPDATE bee_boxes SET ? WHERE box_id = ?";
  db.query(sql, [updates, id], (err, result) => {
    if (err) {
      console.error(`Error updating box ${id}:`, err);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Bee box not found." });
    }
    logHistory(id, 'DETAILS_UPDATED', null, updates, user_id, 'Box details updated.');
    res.json({ message: "Bee box details updated successfully." });
  });
};

// Update the status and location of a bee box
exports.updateBoxStatus = (req, res) => {
    const { id } = req.params;
    const { status, location, notes, distributed_to } = req.body;
    const user_id = req.user.id;

    if (!status || !location) {
        return res.status(400).json({ message: "Missing required fields: status and location." });
    }

    // First, get the old state for logging
    db.query("SELECT status, location FROM bee_boxes WHERE box_id = ?", [id], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ message: "Bee box not found." });
        }
        
        const oldState = results[0];
        const updates = { status, location, notes, distributed_to: location === 'DISTRIBUTED' ? distributed_to : null };

        const sql = "UPDATE bee_boxes SET ? WHERE box_id = ?";
        db.query(sql, [updates, id], (err, result) => {
            if (err) {
                console.error(`Error updating box status for ${id}:`, err);
                return res.status(500).json({ error: err.message });
            }
            logHistory(id, 'STATUS_LOCATION_CHANGE', oldState, updates, user_id, notes);
            res.json({ message: "Bee box status updated successfully." });
        });
    });
};


// Get the history for a specific bee box
exports.getBoxHistory = (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT h.*, u.name as recorded_by_name
    FROM box_history h
    LEFT JOIN users u ON h.recorded_by = u.id
    WHERE h.box_id = ?
    ORDER BY h.timestamp DESC
  `;
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error(`Error fetching history for box ${id}:`, err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

// Generate and return the comprehensive report
exports.getComprehensiveReport = (req, res) => {
    const sql = "SELECT status, location FROM bee_boxes";
    db.query(sql, (err, boxes) => {
        if (err) {
            console.error("Error fetching boxes for report:", err);
            return res.status(500).json({ error: err.message });
        }

        const total_boxes_with_colonies = boxes.filter(b => b.status === 'ACTIVE').length;
        const total_boxes_distributed = boxes.filter(b => b.location === 'DISTRIBUTED').length;
        const traveling_boxes_with_colonies = boxes.filter(b => b.location === 'TRAVELING' && b.status === 'ACTIVE').length;
        const empty_boxes = boxes.filter(b => b.status === 'EMPTY').length;
        const boxes_that_have_flown_away = boxes.filter(b => b.status === 'ABSCONDED').length;

        const total_boxes = boxes.length;
        const active_colony_ratio = total_boxes > 0 ? (total_boxes_with_colonies / total_boxes) * 100 : 0;
        const empty_box_ratio = total_boxes > 0 ? (empty_boxes / total_boxes) * 100 : 0;
        const absconded_ratio = total_boxes > 0 ? (boxes_that_have_flown_away / total_boxes) * 100 : 0;

        const report = {
            Report_Date: new Date().toISOString(),
            Overall_Summary: {
                Total_Bee_Boxes_Managed: total_boxes,
                Total_Active_Colonies: total_boxes_with_colonies,
                Active_Colony_Ratio: `${active_colony_ratio.toFixed(2)}%`
            },
            Bee_Boxes_With_Colonies: {
                Count: total_boxes_with_colonies,
                Significance: "Indicates the current productive units. A high count suggests a healthy and expanding operation.",
                Considerations: [
                    "Ensure adequate forage and water sources.",
                    "Monitor for pests, diseases, and queen health.",
                    "Plan for swarm prevention or controlled splits to expand."
                ]
            },
            Bee_Boxes_Distributed: {
                Count: total_boxes_distributed,
                Significance: "Represents boxes placed with external partners (e.g., farmers). Important for community engagement, pollination services, or income generation.",
                Considerations: [
                    "Maintain clear agreements with partners regarding care and harvest.",
                    "Schedule regular check-ups or provide training to partners.",
                    "Track honey production or pollination success from these units."
                ]
            },
            Traveling_Boxes_With_Colonies: {
                Count: traveling_boxes_with_colonies,
                Significance: "Boxes in transit or temporarily moved for specific purposes (e.g., migratory beekeeping for pollination). Requires careful logistics and health monitoring.",
                Considerations: [
                    "Ensure boxes are secured and well-ventilated during transport.",
                    "Monitor for stress, overheating, or colony disturbance.",
                    "Confirm destination site suitability and resource availability."
                ]
            },
            Empty_Boxes: {
                Count: empty_boxes,
                Significance: "Available resources for new colonies or temporary storage. A significant number can indicate opportunities for expansion or recent colony losses.",
                Considerations: [
                    "Inspect empty boxes for pests (e.g., wax moths) or signs of disease.",
                    "Clean and prepare for future use (e.g., bait for swarms, host new splits).",
                    "If many are empty unexpectedly, investigate reasons for colony loss."
                ],
                Typical_Thresholds: "An operation should typically aim for a low empty box ratio (e.g., <10-20%) unless actively expanding or recovering from losses. Persistent high numbers might indicate management issues or high colony mortality."
            },
            Boxes_That_Have_Flown_Away: {
                Count: boxes_that_have_flown_away,
                Significance: "A serious indication of colony abscondment, often due to pests, disease, lack of resources, disturbance, or poor hive conditions. Represents a direct loss of a productive unit.",
                Considerations: [
                    "Immediately investigate the empty box for clues (pests, signs of disease, remaining resources).",
                    "Review management practices for the affected apiary/colony (e.g., feeding, mite treatment).",
                    "Strengthen remaining colonies against similar issues."
                ],
                Typical_Thresholds: "Any abscondment is undesirable. A ratio above 2-5% could signal significant underlying issues requiring urgent attention."
            },
            Health_Ratios: {
                Empty_Box_Ratio: `${empty_box_ratio.toFixed(2)}%`,
                Absconded_Box_Ratio: `${absconded_ratio.toFixed(2)}%`
            }
        };

        res.json(report);
    });
};

// Delete a bee box
exports.deleteBox = (req, res) => {
    const { id } = req.params;

    // We must delete from box_history first if we didn't use ON DELETE CASCADE,
    // but we did, so we can delete directly from bee_boxes.
    db.query("DELETE FROM bee_boxes WHERE box_id = ?", [id], (err, result) => {
        if (err) {
            console.error(`Error deleting box ${id}:`, err);
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Bee box not found." });
        }
        res.json({ message: "Bee box and its history have been deleted successfully." });
    });
};
