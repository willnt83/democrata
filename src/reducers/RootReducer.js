const initState = {
    pageTitle: [],
    habilidades: [],
    conteudos: [],
    areasDeConhecimento: [],
    questoes: []
}

const RootReducer = (state = initState, action) => {
    if(action.type === 'SET_PAGETITLE'){
        return {
            ...state,
            pageTitle: action.pageTitle
        }
    }
    else if(action.type === 'SET_HABILIDADES'){
        return {
            ...state,
            habilidades: action.habilidades
        }
    }
    else if(action.type === 'SET_CONTEUDOS'){
        return{
            ...state,
            conteudos: action.conteudos
        }
    }
    else if(action.type === 'SET_AREAS_DE_CONHECIMENTO'){
        return{
            ...state,
            areasDeConhecimento: action.areasDeConhecimento
        }
    }
    else if(action.type === 'SET_QUESTOES'){
        return{
            ...state,
            questoes: action.questoes
        }
    }
    return state;
}

export default RootReducer;