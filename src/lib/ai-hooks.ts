"use client"

import { useState, useCallback } from 'react'
import { aiService, SentimentResult, ChatResponse, PredictionResult } from './ai-service'

/**
 * Hook untuk analisis sentimen
 */
export function useSentimentAnalysis() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const [result, setResult] = useState<SentimentResult | null>(null)

    const analyze = useCallback(async (text: string) => {
        setLoading(true)
        setError(null)

        try {
            const data = await aiService.analyzeSentiment(text)
            setResult(data)
            return data
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Sentiment analysis failed')
            setError(error)
            throw error
        } finally {
            setLoading(false)
        }
    }, [])

    return { analyze, result, loading, error }
}

/**
 * Hook untuk chatbot PRISMA
 */
export function usePrismaChat() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const [messages, setMessages] = useState<Array<{
        role: 'user' | 'assistant'
        content: string
        intent?: string
    }>>([])

    const sendMessage = useCallback(async (message: string, useAi: boolean = false) => {
        setLoading(true)
        setError(null)

        // Add user message
        setMessages(prev => [...prev, { role: 'user', content: message }])

        try {
            const response = await aiService.chat(message, useAi)

            // Add assistant message
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: response.response,
                intent: response.intent
            }])

            return response
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Chat failed')
            setError(error)
            throw error
        } finally {
            setLoading(false)
        }
    }, [])

    const clearHistory = useCallback(() => {
        setMessages([])
    }, [])

    return { sendMessage, messages, loading, error, clearHistory }
}

/**
 * Hook untuk prediksi keuangan
 */
export function useFinancialPrediction() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const [prediction, setPrediction] = useState<PredictionResult | null>(null)

    const predict = useCallback(async (monthsAhead: number = 6) => {
        setLoading(true)
        setError(null)

        try {
            const data = await aiService.predictFinancial(monthsAhead)
            setPrediction(data)
            return data
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Prediction failed')
            setError(error)
            throw error
        } finally {
            setLoading(false)
        }
    }, [])

    return { predict, prediction, loading, error }
}

/**
 * Hook untuk prediksi churn warga
 */
export function useChurnPrediction() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const [predictions, setPredictions] = useState<{
        predictions: Array<{
            warga_id: string
            churn_probability: number
            risk_level: 'tinggi' | 'sedang' | 'rendah'
        }>
        at_risk_count: number
    } | null>(null)

    const predict = useCallback(async (wargaData: Array<Record<string, unknown>>) => {
        setLoading(true)
        setError(null)

        try {
            const data = await aiService.predictChurn(wargaData)
            setPredictions(data)
            return data
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Churn prediction failed')
            setError(error)
            throw error
        } finally {
            setLoading(false)
        }
    }, [])

    return { predict, predictions, loading, error }
}

/**
 * Hook untuk rekomendasi kegiatan
 */
export function useActivityRecommendations() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const [recommendations, setRecommendations] = useState<Array<{
        id: string
        name: string
        score: number
    }>>([])

    const getRecommendations = useCallback(async (wargaId: string, n: number = 5) => {
        setLoading(true)
        setError(null)

        try {
            const data = await aiService.getActivityRecommendations(wargaId, n)
            setRecommendations(data.recommendations)
            return data
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Recommendations failed')
            setError(error)
            throw error
        } finally {
            setLoading(false)
        }
    }, [])

    return { getRecommendations, recommendations, loading, error }
}

/**
 * Hook untuk segmentasi warga
 */
export function useCitizenClustering() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const [clusters, setClusters] = useState<{
        clusters: Array<{
            citizen_id: string
            segment: string
            segment_id: number
        }>
        segment_distribution: Record<string, number>
    } | null>(null)

    const cluster = useCallback(async (
        citizenData: Array<Record<string, unknown>>,
        nClusters: number = 4
    ) => {
        setLoading(true)
        setError(null)

        try {
            const data = await aiService.clusterCitizens(citizenData, nClusters)
            setClusters(data)
            return data
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Clustering failed')
            setError(error)
            throw error
        } finally {
            setLoading(false)
        }
    }, [])

    return { cluster, clusters, loading, error }
}

/**
 * Hook untuk image classification
 */
export function useImageClassification() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const [result, setResult] = useState<{
        predicted_class: string
        confidence: number
        top_5: Array<{ class: string; confidence: number }>
    } | null>(null)

    const classify = useCallback(async (file: File) => {
        setLoading(true)
        setError(null)

        try {
            const data = await aiService.classifyImage(file)
            setResult(data.predictions)
            return data
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Classification failed')
            setError(error)
            throw error
        } finally {
            setLoading(false)
        }
    }, [])

    return { classify, result, loading, error }
}

/**
 * Hook untuk status AI backend
 */
export function useAIStatus() {
    const [loading, setLoading] = useState(false)
    const [isHealthy, setIsHealthy] = useState<boolean | null>(null)
    const [modelStatus, setModelStatus] = useState<Record<string, { status: string; type: string }> | null>(null)

    const checkHealth = useCallback(async () => {
        setLoading(true)

        try {
            const healthy = await aiService.healthCheck()
            setIsHealthy(healthy)

            if (healthy) {
                const status = await aiService.getModelStatus()
                setModelStatus(status.models)
            }

            return healthy
        } catch {
            setIsHealthy(false)
            return false
        } finally {
            setLoading(false)
        }
    }, [])

    return { checkHealth, isHealthy, modelStatus, loading }
}
