import React, { Component } from 'react'
import { Layout, Tabs } from 'antd'
import { connect } from 'react-redux'
import axios from "axios"
import { withRouter } from "react-router-dom"
import AcompanhamentoSetor from './AcompanhamentoSetor'
import moment from 'moment'
import 'moment/locale/pt-br'
moment.locale('pt-br')


const { Content } = Layout

class Acompanhamento extends Component {
    constructor(props) {
        super()
        props.setPageTitle('Acompanhamento de Produção')
    }

    state = {
        tabs: [],
        tabSetorId: null,
        firstLoad: true
    }

    requestGetProducaoAcompanhamento = (id) => {
        var filter = (id !== null && typeof(id) !== 'undefined') ? '?id_producao='+id : ''
        axios
        .get(this.props.backEndPoint + '/getProducaoAcompanhamento'+filter)
        .then(res => {
            if(res.data.payload){
                // Tabs
                this.setState({
                    tabs: res.data.payload.map(setor => {
                        return({
                            key: setor.id,
                            description: setor.nome
                        })
                    })
                })
                this.props.setProducaoAcompanhamento(res.data.payload)
                if(this.state.firstLoad){
                    this.setState({
                        tabSetorId: res.data.payload[0].id,
                        firstLoad: false
                    })
                }
            }
            else
                console.log('Nenhum registro encontrado')

        })
        .catch(error => {
            console.log(error)
        })
    }

    handleTabChange = (key) => {
        this.setState({tabSetorId: key})
    }

    componentWillReceiveProps(nextProps){
        var key = !nextProps.producaoMainData ? null : this.props.producaoMainData.key
        this.requestGetProducaoAcompanhamento(key)
    }

    render(){
        return(
            <Content
                id="contentAcompanhamento"
                style={{
                    margin: "24px 16px",
                    padding: 24,
                    background: "#fff",
                    minHeight: 280,
                    position: 'relative'
                }}
            >
                <Tabs onChange={this.handleTabChange}>
                    {
                        this.state.tabs.map(setor => {
                            return(
                                <Tabs.TabPane key={setor.key} tab={setor.description}>
                                    <AcompanhamentoSetor idSetor={this.state.tabSetorId} nomeSetor={setor.description} requestGetProducaoAcompanhamento={this.requestGetProducaoAcompanhamento} />
                                </Tabs.TabPane>
                            )
                        })
                    }
                </Tabs>
            </Content>
        )
    }
}


const MapStateToProps = (state) => {
	return {
        backEndPoint: state.backEndPoint,
        producaoMainData: state.producaoMainData
	}
}

const mapDispatchToProps = (dispatch) => {
    return {
        setPageTitle: (pageTitle) => { dispatch({ type: 'SET_PAGETITLE', pageTitle }) },
        setProducaoAcompanhamento: (producaoAcompanhamento) => { dispatch({ type: 'SET_PRODUCAOACOMPANHAMENTO', producaoAcompanhamento }) }
    }
}

export default connect(MapStateToProps, mapDispatchToProps)(withRouter(Acompanhamento))