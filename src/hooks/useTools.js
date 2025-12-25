import { useState, useEffect } from 'react';
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    increment,
    serverTimestamp,
    where
} from 'firebase/firestore';
import { db } from '../firebase';

export function useTools() {
    const [tools, setTools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const q = query(collection(db, 'tools'), orderBy('name'));

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const toolsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setTools(toolsData);
                setLoading(false);
            },
            (err) => {
                console.error('Error fetching tools:', err);
                setError(err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    // Get only active tools (for user dashboard)
    const activeTools = tools.filter(tool => tool.isActive !== false);

    const addTool = async (toolData) => {
        try {
            const docRef = await addDoc(collection(db, 'tools'), {
                ...toolData,
                isActive: true,
                clickCount: 0,
                favoriteCount: 0,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            return docRef.id;
        } catch (err) {
            console.error('Error adding tool:', err);
            throw err;
        }
    };

    const updateTool = async (toolId, toolData) => {
        try {
            const toolRef = doc(db, 'tools', toolId);
            await updateDoc(toolRef, {
                ...toolData,
                updatedAt: serverTimestamp()
            });
        } catch (err) {
            console.error('Error updating tool:', err);
            throw err;
        }
    };

    const deleteTool = async (toolId) => {
        try {
            await deleteDoc(doc(db, 'tools', toolId));
        } catch (err) {
            console.error('Error deleting tool:', err);
            throw err;
        }
    };

    const updateFavoriteCount = async (toolId, incrementValue) => {
        try {
            const toolRef = doc(db, 'tools', toolId);
            await updateDoc(toolRef, {
                favoriteCount: increment(incrementValue)
            });
        } catch (err) {
            console.error('Error updating favorite count:', err);
        }
    };

    /**
     * Track a tool click - increments click count and records click event
     * @param {string} toolId - The tool ID
     * @param {string} userId - The user ID (or 'anonymous')
     */
    const trackToolClick = async (toolId, userId = 'anonymous') => {
        try {
            // Increment the click count on the tool
            const toolRef = doc(db, 'tools', toolId);
            await updateDoc(toolRef, {
                clickCount: increment(1),
                lastClickedAt: serverTimestamp()
            });

            // Record detailed click event for statistics
            await addDoc(collection(db, 'toolClicks'), {
                toolId,
                userId,
                clickedAt: serverTimestamp()
            });

            console.log('[Tools] Click tracked for tool:', toolId);
        } catch (err) {
            console.error('Error tracking tool click:', err);
            // Don't throw - we don't want to block navigation if tracking fails
        }
    };

    /**
     * Toggle tool active status
     * @param {string} toolId 
     * @param {boolean} isActive 
     */
    const toggleToolActive = async (toolId, isActive) => {
        try {
            const toolRef = doc(db, 'tools', toolId);
            await updateDoc(toolRef, {
                isActive,
                updatedAt: serverTimestamp()
            });
        } catch (err) {
            console.error('Error toggling tool active status:', err);
            throw err;
        }
    };

    return {
        tools,
        activeTools,
        loading,
        error,
        addTool,
        updateTool,
        deleteTool,
        updateFavoriteCount,
        trackToolClick,
        toggleToolActive
    };
}
