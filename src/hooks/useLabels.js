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
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

export function useLabels() {
    const [labels, setLabels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const q = query(collection(db, 'labels'), orderBy('order'));

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const labelsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setLabels(labelsData);
                setLoading(false);
            },
            (err) => {
                console.error('Error fetching labels:', err);
                setError(err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    const addLabel = async (labelData) => {
        try {
            const maxOrder = labels.length > 0
                ? Math.max(...labels.map(l => l.order || 0)) + 1
                : 0;

            const docRef = await addDoc(collection(db, 'labels'), {
                ...labelData,
                order: maxOrder,
                createdAt: serverTimestamp()
            });
            return docRef.id;
        } catch (err) {
            console.error('Error adding label:', err);
            throw err;
        }
    };

    const updateLabel = async (labelId, labelData) => {
        try {
            const labelRef = doc(db, 'labels', labelId);
            await updateDoc(labelRef, labelData);
        } catch (err) {
            console.error('Error updating label:', err);
            throw err;
        }
    };

    const deleteLabel = async (labelId) => {
        try {
            await deleteDoc(doc(db, 'labels', labelId));
        } catch (err) {
            console.error('Error deleting label:', err);
            throw err;
        }
    };

    return {
        labels,
        loading,
        error,
        addLabel,
        updateLabel,
        deleteLabel
    };
}
