import React, { Component } from 'react'
//import { Layout, Tabs, Table, Icon, Popconfirm, Modal, Input, Button, Row, Col, Form, Select, DatePicker, Divider } from 'antd'
import { Layout, Tabs } from 'antd'
//import { Tooltip } from '@material-ui/core/'
import { connect } from 'react-redux'
import axios from "axios"
import { withRouter } from "react-router-dom"

import AcompanhamentoSetor from './AcompanhamentoSetor'
//import ptBr from 'antd/lib/locale-provider/pt_BR'
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
        tabs: []
    }

    requestGetProducaoAcompanhamento = (id) => {
        axios
        .get('http://localhost/getProducaoAcompanhamento?id_producao='+id)
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
            }
            else
                console.log('Nenhum registro encontrado')

        })
        .catch(error => {
            console.log(error)
        })
    }

    componentWillMount(){
        this.requestGetProducaoAcompanhamento(this.props.producaoMainData.key)
    }

    render(){
        return(
            <Content
                style={{
                    margin: "24px 16px",
                    padding: 24,
                    background: "#fff",
                    minHeight: 280
                }}
            >
                <Tabs defaultActiveKey="1">
                    {
                        this.state.tabs.map(setor => {
                            return(<Tabs.TabPane tab={setor.description} key={setor.key}>
                                <AcompanhamentoSetor idSetor={setor.key} />
                            </Tabs.TabPane>)
                        })
                        
                    }
                </Tabs>
            </Content>
        )
    }
}

const MapStateToProps = (state) => {
	return {
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